import { prisma } from "@/lib/prisma";
import { EXPIRY_WARNING_DAYS } from "@/lib/config";

export async function getLowStockIngredients() {
  const ingredients = await prisma.ingredient.findMany({
    where: { lowStockThreshold: { not: null } },
    orderBy: { name: "asc" },
  });
  return ingredients.filter(
    (i) => i.lowStockThreshold !== null && i.quantityOnHand < i.lowStockThreshold
  );
}

export async function getExpiringIngredientPurchases() {
  const cutoff = new Date(Date.now() + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000);
  return prisma.ingredientPurchase.findMany({
    where: { expiryDate: { not: null, lte: cutoff, gte: new Date() } },
    include: { ingredient: true },
    orderBy: { expiryDate: "asc" },
  });
}

export async function getExpiringFinishedBatches() {
  const cutoff = new Date(Date.now() + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000);
  return prisma.productionBatch.findMany({
    where: {
      expiryDate: { not: null, lte: cutoff, gte: new Date() },
      remainingQuantity: { gt: 0 },
    },
    include: { recipe: true },
    orderBy: { expiryDate: "asc" },
  });
}
