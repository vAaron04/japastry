import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/require-role";

export default async function ReportsPage() {
  await requireOwner();

  const recipes = await prisma.recipe.findMany({
    include: { batches: true, sales: true },
    orderBy: { name: "asc" },
  });

  const rows = recipes.map((r) => {
    const cost = r.batches.reduce((sum, b) => sum + b.totalCost, 0);
    const revenue = r.sales.reduce((sum, s) => sum + s.revenue, 0);
    const unitsProduced = r.batches.reduce((sum, b) => sum + b.quantityProduced, 0);
    const unitsSold = r.sales.reduce((sum, s) => sum + s.quantity, 0);
    return { id: r.id, name: r.name, cost, revenue, profit: revenue - cost, unitsProduced, unitsSold };
  });

  const totalCost = rows.reduce((sum, r) => sum + r.cost, 0);
  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <p className="text-sm text-black/60 dark:text-white/60">
        Cost and revenue across all time, by product.
      </p>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-black/10 p-4 dark:border-white/10">
          <p className="text-sm text-black/60 dark:text-white/60">Total ingredient cost</p>
          <p className="text-2xl font-semibold">${totalCost.toFixed(2)}</p>
        </div>
        <div className="rounded-md border border-black/10 p-4 dark:border-white/10">
          <p className="text-sm text-black/60 dark:text-white/60">Total revenue</p>
          <p className="text-2xl font-semibold">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-md border border-black/10 p-4 dark:border-white/10">
          <p className="text-sm text-black/60 dark:text-white/60">Total profit</p>
          <p className="text-2xl font-semibold">${(totalRevenue - totalCost).toFixed(2)}</p>
        </div>
      </section>

      <section className="overflow-x-auto rounded-md border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Produced</th>
              <th className="px-3 py-2 text-left">Sold</th>
              <th className="px-3 py-2 text-left">Cost</th>
              <th className="px-3 py-2 text-left">Revenue</th>
              <th className="px-3 py-2 text-left">Profit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.unitsProduced}</td>
                <td className="px-3 py-2">{r.unitsSold}</td>
                <td className="px-3 py-2">${r.cost.toFixed(2)}</td>
                <td className="px-3 py-2">${r.revenue.toFixed(2)}</td>
                <td className="px-3 py-2">${r.profit.toFixed(2)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-black/50 dark:text-white/50">
                  No data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
