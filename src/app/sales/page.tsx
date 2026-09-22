import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";
import { SalesForm } from "@/components/sales-form";

export default async function SalesPage() {
  await requireUser();
  const [recipes, sales] = await Promise.all([
    prisma.recipe.findMany({ orderBy: { name: "asc" } }),
    prisma.sale.findMany({
      include: { recipe: true, staff: true },
      orderBy: { soldAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Sales</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Log a sale</h2>
        <SalesForm recipes={recipes} />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Recent sales</h2>
        <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-left">Quantity</th>
                <th className="px-3 py-2 text-left">Revenue</th>
                <th className="px-3 py-2 text-left">By</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-t border-black/10 dark:border-white/10">
                  <td className="px-3 py-2">{s.soldAt.toLocaleDateString()}</td>
                  <td className="px-3 py-2">{s.recipe.name}</td>
                  <td className="px-3 py-2">{s.quantity}</td>
                  <td className="px-3 py-2">${s.revenue.toFixed(2)}</td>
                  <td className="px-3 py-2">{s.staff.name}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-black/50 dark:text-white/50">
                    No sales logged yet
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
