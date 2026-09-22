import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";
import {
  getExpiringFinishedBatches,
  getExpiringIngredientPurchases,
  getLowStockIngredients,
} from "@/lib/alerts";

function startOfDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [ingredients, batches, lowStock, expiringIngredients, expiringBatches, salesLast7Days] =
    await Promise.all([
      prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
      prisma.productionBatch.findMany({
        where: { remainingQuantity: { gt: 0 } },
        include: { recipe: true },
      }),
      getLowStockIngredients(),
      getExpiringIngredientPurchases(),
      getExpiringFinishedBatches(),
      prisma.sale.findMany({ where: { soldAt: { gte: startOfDaysAgo(7) } } }),
    ]);

  const finishedByRecipe = new Map<string, { name: string; unit: string; quantity: number }>();
  for (const batch of batches) {
    const existing = finishedByRecipe.get(batch.recipeId);
    if (existing) {
      existing.quantity += batch.remainingQuantity;
    } else {
      finishedByRecipe.set(batch.recipeId, {
        name: batch.recipe.name,
        unit: batch.recipe.yieldUnit,
        quantity: batch.remainingQuantity,
      });
    }
  }

  const salesUnits = salesLast7Days.reduce((sum, s) => sum + s.quantity, 0);
  const salesRevenue = salesLast7Days.reduce((sum, s) => sum + s.revenue, 0);

  let batchCostLast7Days = 0;
  if (user.role === "OWNER") {
    const batchesLast7Days = await prisma.productionBatch.findMany({
      where: { producedAt: { gte: startOfDaysAgo(7) } },
    });
    batchCostLast7Days = batchesLast7Days.reduce((sum, b) => sum + b.totalCost, 0);
  }

  const alertCount = lowStock.length + expiringIngredients.length + expiringBatches.length;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {alertCount > 0 && (
        <section className="rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <h2 className="mb-2 font-medium text-amber-900 dark:text-amber-200">
            Alerts ({alertCount})
          </h2>
          <ul className="flex flex-col gap-1 text-sm text-amber-900 dark:text-amber-200">
            {lowStock.map((i) => (
              <li key={i.id}>
                Low stock: <strong>{i.name}</strong> ({i.quantityOnHand.toFixed(2)} {i.unit} left,
                threshold {i.lowStockThreshold})
              </li>
            ))}
            {expiringIngredients.map((p) => (
              <li key={p.id}>
                Ingredient expiring soon: <strong>{p.ingredient.name}</strong> purchase (
                {p.quantity} {p.ingredient.unit}) expires{" "}
                {p.expiryDate?.toLocaleDateString()}
              </li>
            ))}
            {expiringBatches.map((b) => (
              <li key={b.id}>
                Finished goods expiring soon: <strong>{b.recipe.name}</strong> (
                {b.remainingQuantity.toFixed(2)} {b.recipe.yieldUnit}) expires{" "}
                {b.expiryDate?.toLocaleDateString()}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-black/10 p-4 dark:border-white/10">
          <p className="text-sm text-black/60 dark:text-white/60">Sales, last 7 days</p>
          <p className="text-2xl font-semibold">{salesUnits.toFixed(0)} units</p>
        </div>
        <div className="rounded-md border border-black/10 p-4 dark:border-white/10">
          <p className="text-sm text-black/60 dark:text-white/60">Revenue, last 7 days</p>
          <p className="text-2xl font-semibold">${salesRevenue.toFixed(2)}</p>
        </div>
        {user.role === "OWNER" && (
          <div className="rounded-md border border-black/10 p-4 dark:border-white/10">
            <p className="text-sm text-black/60 dark:text-white/60">Profit, last 7 days</p>
            <p className="text-2xl font-semibold">
              ${(salesRevenue - batchCostLast7Days).toFixed(2)}
            </p>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Raw ingredient stock</h2>
        <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                <th className="px-3 py-2 text-left">Ingredient</th>
                <th className="px-3 py-2 text-left">On hand</th>
                <th className="px-3 py-2 text-left">Low stock at</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((i) => (
                <tr key={i.id} className="border-t border-black/10 dark:border-white/10">
                  <td className="px-3 py-2">{i.name}</td>
                  <td className="px-3 py-2">
                    {i.quantityOnHand.toFixed(2)} {i.unit}
                  </td>
                  <td className="px-3 py-2">
                    {i.lowStockThreshold ?? "—"}
                  </td>
                </tr>
              ))}
              {ingredients.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-black/50 dark:text-white/50">
                    No ingredients yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Finished product stock</h2>
        <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-left">In stock</th>
              </tr>
            </thead>
            <tbody>
              {[...finishedByRecipe.values()].map((f) => (
                <tr key={f.name} className="border-t border-black/10 dark:border-white/10">
                  <td className="px-3 py-2">{f.name}</td>
                  <td className="px-3 py-2">
                    {f.quantity.toFixed(2)} {f.unit}
                  </td>
                </tr>
              ))}
              {finishedByRecipe.size === 0 && (
                <tr>
                  <td colSpan={2} className="px-3 py-4 text-center text-black/50 dark:text-white/50">
                    No finished goods in stock
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
