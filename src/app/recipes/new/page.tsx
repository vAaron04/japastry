import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/require-role";
import { RecipeForm } from "@/components/recipe-form";

export default async function NewRecipePage() {
  await requireOwner();
  const ingredients = await prisma.ingredient.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New recipe</h1>
      <RecipeForm
        ingredients={ingredients.map((i) => ({ id: i.id, name: i.name, unit: i.unit }))}
      />
    </div>
  );
}
