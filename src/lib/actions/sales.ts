"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";

const logSaleSchema = z.object({
  recipeId: z.string().min(1),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  revenue: z.coerce.number().nonnegative("Revenue cannot be negative"),
});

export async function logSale(formData: FormData) {
  const user = await requireUser();

  const parsed = logSaleSchema.safeParse({
    recipeId: formData.get("recipeId"),
    quantity: formData.get("quantity"),
    revenue: formData.get("revenue"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { recipeId, quantity, revenue } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const batches = await tx.productionBatch.findMany({
        where: { recipeId, remainingQuantity: { gt: 0 } },
        orderBy: [{ expiryDate: "asc" }, { producedAt: "asc" }],
      });

      const totalAvailable = batches.reduce((sum, b) => sum + b.remainingQuantity, 0);
      if (totalAvailable < quantity) {
        throw new Error(
          `Not enough stock to sell (need ${quantity}, have ${totalAvailable.toFixed(2)})`
        );
      }

      let remainingToSell = quantity;
      for (const batch of batches) {
        if (remainingToSell <= 0) break;

        const takeFromBatch = Math.min(batch.remainingQuantity, remainingToSell);
        const proratedRevenue = revenue * (takeFromBatch / quantity);

        await tx.productionBatch.update({
          where: { id: batch.id },
          data: { remainingQuantity: { decrement: takeFromBatch } },
        });

        await tx.sale.create({
          data: {
            recipeId,
            productionBatchId: batch.id,
            quantity: takeFromBatch,
            revenue: proratedRevenue,
            staffId: user.id,
          },
        });

        remainingToSell -= takeFromBatch;
      }
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to log sale" };
  }

  revalidatePath("/sales");
  revalidatePath("/production");
  revalidatePath("/dashboard");
  return { success: true };
}
