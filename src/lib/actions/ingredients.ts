"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";

const createIngredientSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  unit: z.string().trim().min(1, "Unit is required"),
  lowStockThreshold: z.coerce.number().nonnegative().optional(),
});

export async function createIngredient(formData: FormData) {
  await requireUser();

  const parsed = createIngredientSchema.safeParse({
    name: formData.get("name"),
    unit: formData.get("unit"),
    lowStockThreshold: formData.get("lowStockThreshold") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.ingredient.create({
    data: {
      name: parsed.data.name,
      unit: parsed.data.unit,
      lowStockThreshold: parsed.data.lowStockThreshold ?? null,
    },
  });

  revalidatePath("/ingredients");
  return { success: true };
}

const recordPurchaseSchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  totalCost: z.coerce.number().nonnegative("Cost cannot be negative"),
  purchaseDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
});

export async function recordPurchase(formData: FormData) {
  await requireUser();

  const parsed = recordPurchaseSchema.safeParse({
    ingredientId: formData.get("ingredientId"),
    quantity: formData.get("quantity"),
    totalCost: formData.get("totalCost"),
    purchaseDate: formData.get("purchaseDate") || undefined,
    expiryDate: formData.get("expiryDate") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { ingredientId, quantity, totalCost, purchaseDate, expiryDate } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const ingredient = await tx.ingredient.findUniqueOrThrow({ where: { id: ingredientId } });

    const existingValue = ingredient.quantityOnHand * ingredient.avgCostPerUnit;
    const newQuantity = ingredient.quantityOnHand + quantity;
    const newAvgCost = newQuantity > 0 ? (existingValue + totalCost) / newQuantity : 0;

    await tx.ingredient.update({
      where: { id: ingredientId },
      data: {
        quantityOnHand: newQuantity,
        avgCostPerUnit: newAvgCost,
      },
    });

    await tx.ingredientPurchase.create({
      data: {
        ingredientId,
        quantity,
        totalCost,
        purchaseDate: purchaseDate ?? new Date(),
        expiryDate: expiryDate ?? null,
      },
    });
  });

  revalidatePath("/ingredients");
  revalidatePath("/dashboard");
  return { success: true };
}
