import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/logout";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/recipes", label: "Recipes" },
  { href: "/production", label: "Production" },
  { href: "/sales", label: "Sales" },
];

const OWNER_LINKS = [
  { href: "/reports", label: "Reports" },
  { href: "/admin/users", label: "Staff" },
];

export async function Nav() {
  const session = await auth();
  if (!session?.user) return null;

  const links = session.user.role === "OWNER" ? [...LINKS, ...OWNER_LINKS] : LINKS;

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-3 font-semibold">🍞 Japastry</span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-black/60 dark:text-white/60">
          <span>
            {session.user.name} ({session.user.role.toLowerCase()})
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-black/10 px-3 py-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
