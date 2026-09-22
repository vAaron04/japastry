import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";
import { ProductionForm } from "@/components/production-form";

export default async function ProductionPage() {
  const user = await requireUser();
  const [recipes, batches] = await Promise.all([
    prisma.recipe.findMany({ orderBy: { name: "asc" } }),
    prisma.productionBatch.findMany({
      include: { recipe: true, staff: true },
      orderBy: { producedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Production</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Log a production batch</h2>
        <ProductionForm recipes={recipes} />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Recent batches</h2>
        <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Recipe</th>
                <th className="px-3 py-2 text-left">Produced</th>
                <th className="px-3 py-2 text-left">Remaining</th>
                {user.role === "OWNER" && <th className="px-3 py-2 text-left">Cost</th>}
                <th className="px-3 py-2 text-left">By</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-t border-black/10 dark:border-white/10">
                  <td className="px-3 py-2">{b.producedAt.toLocaleDateString()}</td>
                  <td className="px-3 py-2">{b.recipe.name}</td>
                  <td className="px-3 py-2">
                    {b.quantityProduced} {b.recipe.yieldUnit}
                  </td>
                  <td className="px-3 py-2">
                    {b.remainingQuantity} {b.recipe.yieldUnit}
                  </td>
                  {user.role === "OWNER" && (
                    <td className="px-3 py-2">${b.totalCost.toFixed(2)}</td>
                  )}
                  <td className="px-3 py-2">{b.staff.name}</td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td
                    colSpan={user.role === "OWNER" ? 6 : 5}
                    className="px-3 py-4 text-center text-black/50 dark:text-white/50"
                  >
                    No production logged yet
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
