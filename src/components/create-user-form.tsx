"use client";

import { useActionState, useRef, useEffect } from "react";
import { createStaffUser } from "@/lib/actions/users";

type State = { error?: string; success?: boolean } | undefined;

const inputClass =
  "rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-white/5";

export function CreateUserForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => createStaffUser(formData),
    undefined
  );

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="user-name">
          Name
        </label>
        <input id="user-name" name="name" required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="user-email">
          Email
        </label>
        <input id="user-email" name="email" type="email" required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="user-password">
          Password
        </label>
        <input
          id="user-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="user-role">
          Role
        </label>
        <select id="user-role" name="role" defaultValue="STAFF" className={inputClass}>
          <option value="STAFF">Staff</option>
          <option value="OWNER">Owner</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2.5 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Creating..." : "Create account"}
      </button>
      {state?.error && <p role="alert" className="w-full text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
