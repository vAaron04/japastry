import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";

export default async function RecipesPage() {
  const user = await requireUser();
  const recipes = await prisma.recipe.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Recipes</h1>
        {user.role === "OWNER" && (
          <Link
            href="/recipes/new"
            className="rounded-md bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
          >
            + New recipe
          </Link>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {recipes.map((r) => (
          <Link
            key={r.id}
            href={`/recipes/${r.id}`}
            className="rounded-md border border-black/10 p-4 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
          >
            <p className="font-medium">{r.name}</p>
            <p className="text-sm text-black/60 dark:text-white/60">
              Yields {r.yieldQuantity} {r.yieldUnit}
              {r.shelfLifeDays ? ` · ${r.shelfLifeDays}-day shelf life` : ""}
            </p>
          </Link>
        ))}
        {recipes.length === 0 && (
          <p className="text-black/50 dark:text-white/50">No recipes yet.</p>
        )}
      </div>
    </div>
  );
}
