import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { ingredients: { include: { ingredient: true } } },
  });

  if (!recipe) notFound();

  const costPerBatch = recipe.ingredients.reduce(
    (sum, line) => sum + line.quantity * line.ingredient.avgCostPerUnit,
    0
  );
  const costPerUnit = recipe.yieldQuantity > 0 ? costPerBatch / recipe.yieldQuantity : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{recipe.name}</h1>
        {recipe.description && (
          <p className="text-black/60 dark:text-white/60">{recipe.description}</p>
        )}
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          Yields {recipe.yieldQuantity} {recipe.yieldUnit}
          {recipe.shelfLifeDays ? ` · ${recipe.shelfLifeDays}-day shelf life` : ""}
        </p>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-medium">Ingredients per batch</h2>
        <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                <th className="px-3 py-2 text-left">Ingredient</th>
                <th className="px-3 py-2 text-left">Quantity</th>
                {user.role === "OWNER" && <th className="px-3 py-2 text-left">Est. cost</th>}
              </tr>
            </thead>
            <tbody>
              {recipe.ingredients.map((line) => (
                <tr key={line.id} className="border-t border-black/10 dark:border-white/10">
                  <td className="px-3 py-2">{line.ingredient.name}</td>
                  <td className="px-3 py-2">
                    {line.quantity} {line.ingredient.unit}
                  </td>
                  {user.role === "OWNER" && (
                    <td className="px-3 py-2">
                      ${(line.quantity * line.ingredient.avgCostPerUnit).toFixed(2)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {user.role === "OWNER" && (
        <section className="grid max-w-sm gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-black/10 p-4 dark:border-white/10">
            <p className="text-sm text-black/60 dark:text-white/60">Cost per batch</p>
            <p className="text-xl font-semibold">${costPerBatch.toFixed(2)}</p>
          </div>
          <div className="rounded-md border border-black/10 p-4 dark:border-white/10">
            <p className="text-sm text-black/60 dark:text-white/60">
              Cost per {recipe.yieldUnit.replace(/s$/, "")}
            </p>
            <p className="text-xl font-semibold">${costPerUnit.toFixed(2)}</p>
          </div>
        </section>
      )}
    </div>
  );
}
