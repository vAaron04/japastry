"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/require-role";

const createRecipeSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional(),
  yieldQuantity: z.coerce.number().positive("Yield must be greater than 0"),
  yieldUnit: z.string().trim().min(1, "Yield unit is required"),
  shelfLifeDays: z.coerce.number().int().positive().optional(),
});

export async function createRecipe(formData: FormData) {
  await requireOwner();

  const parsed = createRecipeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    yieldQuantity: formData.get("yieldQuantity"),
    yieldUnit: formData.get("yieldUnit"),
    shelfLifeDays: formData.get("shelfLifeDays") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ingredientIds = formData.getAll("ingredientId").map(String).filter(Boolean);
  const quantities = formData.getAll("ingredientQuantity").map(Number);

  if (ingredientIds.length === 0) {
    return { error: "Add at least one ingredient" };
  }

  for (const q of quantities) {
    if (!(q > 0)) {
      return { error: "Ingredient quantities must be greater than 0" };
    }
  }

  const recipe = await prisma.recipe.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      yieldQuantity: parsed.data.yieldQuantity,
      yieldUnit: parsed.data.yieldUnit,
      shelfLifeDays: parsed.data.shelfLifeDays ?? null,
      ingredients: {
        create: ingredientIds.map((ingredientId, i) => ({
          ingredientId,
          quantity: quantities[i],
        })),
      },
    },
  });

  revalidatePath("/recipes");
  redirect(`/recipes/${recipe.id}`);
}
