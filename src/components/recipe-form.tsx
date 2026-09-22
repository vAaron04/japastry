"use client";

import { useActionState, useState } from "react";
import { createRecipe } from "@/lib/actions/recipes";

type State = { error?: string } | undefined;

const inputClass =
  "rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-white/5";

export function RecipeForm({
  ingredients,
}: {
  ingredients: { id: string; name: string; unit: string }[];
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => createRecipe(formData),
    undefined
  );
  const [lineCount, setLineCount] = useState(1);

  if (ingredients.length === 0) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        Add at least one ingredient before creating a recipe.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="recipe-name">
          Recipe / product name
        </label>
        <input id="recipe-name" name="name" required className={inputClass} placeholder="Cinnamon roll" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="recipe-description">
          Description (optional)
        </label>
        <textarea id="recipe-description" name="description" className={inputClass} rows={2} />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="recipe-yield">
            Yield per batch
          </label>
          <input
            id="recipe-yield"
            name="yieldQuantity"
            type="number"
            step="any"
            min="0"
            required
            className={inputClass}
            placeholder="12"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="recipe-yield-unit">
            Yield unit
          </label>
          <input
            id="recipe-yield-unit"
            name="yieldUnit"
            required
            className={inputClass}
            placeholder="pieces"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="recipe-shelf-life">
            Shelf life (days)
          </label>
          <input
            id="recipe-shelf-life"
            name="shelfLifeDays"
            type="number"
            min="1"
            className={inputClass}
            placeholder="optional"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Ingredients needed per batch</p>
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i} className="flex flex-wrap gap-3">
            <select name="ingredientId" required className={`${inputClass} flex-1`}>
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.unit})
                </option>
              ))}
            </select>
            <input
              name="ingredientQuantity"
              type="number"
              step="any"
              min="0"
              required
              placeholder="quantity"
              className={`${inputClass} w-32`}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLineCount((n) => n + 1)}
          className="w-fit rounded-md border border-black/15 px-3 py-1.5 text-sm dark:border-white/20"
        >
          + Add ingredient line
        </button>
      </div>

      {state?.error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-black px-4 py-2.5 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Creating..." : "Create recipe"}
      </button>
    </form>
  );
}
