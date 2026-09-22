import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";
import { AddIngredientForm, RecordPurchaseForm } from "@/components/ingredient-forms";

export default async function IngredientsPage() {
  const user = await requireUser();
  const ingredients = await prisma.ingredient.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Ingredients</h1>

      <section className="overflow-x-auto rounded-md border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">On hand</th>
              <th className="px-3 py-2 text-left">Low stock at</th>
              {user.role === "OWNER" && <th className="px-3 py-2 text-left">Avg. cost/unit</th>}
            </tr>
          </thead>
          <tbody>
            {ingredients.map((i) => (
              <tr key={i.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-3 py-2">{i.name}</td>
                <td className="px-3 py-2">
                  {i.quantityOnHand.toFixed(2)} {i.unit}
                </td>
                <td className="px-3 py-2">{i.lowStockThreshold ?? "—"}</td>
                {user.role === "OWNER" && (
                  <td className="px-3 py-2">${i.avgCostPerUnit.toFixed(4)}</td>
                )}
              </tr>
            ))}
            {ingredients.length === 0 && (
              <tr>
                <td
                  colSpan={user.role === "OWNER" ? 4 : 3}
                  className="px-3 py-4 text-center text-black/50 dark:text-white/50"
                >
                  No ingredients yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Add a new ingredient</h2>
        <AddIngredientForm />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Record a purchase</h2>
        <RecordPurchaseForm
          ingredients={ingredients.map((i) => ({ id: i.id, name: i.name, unit: i.unit }))}
        />
      </section>
    </div>
  );
}
