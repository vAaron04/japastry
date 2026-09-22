"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";

const logBatchSchema = z.object({
  recipeId: z.string().min(1),
  quantityProduced: z.coerce.number().positive("Quantity must be greater than 0"),
});

export async function logProductionBatch(formData: FormData) {
  const user = await requireUser();

  const parsed = logBatchSchema.safeParse({
    recipeId: formData.get("recipeId"),
    quantityProduced: formData.get("quantityProduced"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { recipeId, quantityProduced } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.findUniqueOrThrow({
        where: { id: recipeId },
        include: { ingredients: { include: { ingredient: true } } },
      });

      const scale = quantityProduced / recipe.yieldQuantity;
      let totalCost = 0;

      for (const line of recipe.ingredients) {
        const needed = line.quantity * scale;
        if (line.ingredient.quantityOnHand < needed) {
          throw new Error(
            `Not enough ${line.ingredient.name} in stock (need ${needed.toFixed(2)} ${line.ingredient.unit}, have ${line.ingredient.quantityOnHand.toFixed(2)} ${line.ingredient.unit})`
          );
        }
        totalCost += needed * line.ingredient.avgCostPerUnit;
      }

      for (const line of recipe.ingredients) {
        const needed = line.quantity * scale;
        await tx.ingredient.update({
          where: { id: line.ingredientId },
          data: { quantityOnHand: { decrement: needed } },
        });
      }

      const producedAt = new Date();
      const expiryDate = recipe.shelfLifeDays
        ? new Date(producedAt.getTime() + recipe.shelfLifeDays * 24 * 60 * 60 * 1000)
        : null;

      await tx.productionBatch.create({
        data: {
          recipeId,
          quantityProduced,
          remainingQuantity: quantityProduced,
          totalCost,
          producedAt,
          expiryDate,
          staffId: user.id,
        },
      });
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to log production batch" };
  }

  revalidatePath("/production");
  revalidatePath("/ingredients");
  revalidatePath("/dashboard");
  return { success: true };
}
