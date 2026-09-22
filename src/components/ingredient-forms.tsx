"use client";

import { useActionState, useRef, useEffect } from "react";
import { createIngredient, recordPurchase } from "@/lib/actions/ingredients";

type State = { error?: string; success?: boolean } | undefined;

const inputClass =
  "rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-white/5";

export function AddIngredientForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => createIngredient(formData),
    undefined
  );

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="ing-name">
          Ingredient name
        </label>
        <input id="ing-name" name="name" required className={inputClass} placeholder="Flour" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="ing-unit">
          Unit
        </label>
        <input id="ing-unit" name="unit" required className={inputClass} placeholder="kg" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="ing-threshold">
          Low stock alert at
        </label>
        <input
          id="ing-threshold"
          name="lowStockThreshold"
          type="number"
          step="any"
          min="0"
          className={inputClass}
          placeholder="optional"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2.5 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Adding..." : "Add ingredient"}
      </button>
      {state?.error && <p role="alert" className="w-full text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

export function RecordPurchaseForm({
  ingredients,
}: {
  ingredients: { id: string; name: string; unit: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => recordPurchase(formData),
    undefined
  );

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  if (ingredients.length === 0) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        Add an ingredient first before recording a purchase.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="purchase-ingredient">
          Ingredient
        </label>
        <select id="purchase-ingredient" name="ingredientId" required className={inputClass}>
          {ingredients.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} ({i.unit})
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="purchase-quantity">
          Quantity
        </label>
        <input
          id="purchase-quantity"
          name="quantity"
          type="number"
          step="any"
          min="0"
          required
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="purchase-cost">
          Total cost ($)
        </label>
        <input
          id="purchase-cost"
          name="totalCost"
          type="number"
          step="any"
          min="0"
          required
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="purchase-expiry">
          Expiry date
        </label>
        <input
          id="purchase-expiry"
          name="expiryDate"
          type="date"
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2.5 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Recording..." : "Record purchase"}
      </button>
      {state?.error && <p role="alert" className="w-full text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
