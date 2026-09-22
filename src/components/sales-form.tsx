"use client";

import { useActionState, useRef, useEffect } from "react";
import { logSale } from "@/lib/actions/sales";

type State = { error?: string; success?: boolean } | undefined;

const inputClass =
  "rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-white/5";

export function SalesForm({ recipes }: { recipes: { id: string; name: string }[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => logSale(formData),
    undefined
  );

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  if (recipes.length === 0) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        Create a recipe and log production before recording sales.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="sale-recipe">
          Product
        </label>
        <select id="sale-recipe" name="recipeId" required className={inputClass}>
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="sale-quantity">
          Quantity sold
        </label>
        <input
          id="sale-quantity"
          name="quantity"
          type="number"
          step="any"
          min="0"
          required
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="sale-revenue">
          Revenue ($)
        </label>
        <input
          id="sale-revenue"
          name="revenue"
          type="number"
          step="any"
          min="0"
          required
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2.5 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Logging..." : "Log sale"}
      </button>
      {state?.error && <p role="alert" className="w-full text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
