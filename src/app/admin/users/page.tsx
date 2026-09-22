import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/require-role";
import { CreateUserForm } from "@/components/create-user-form";

export default async function UsersPage() {
  await requireOwner();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Staff accounts</h1>

      <section className="overflow-x-auto rounded-md border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Add an account</h2>
        <CreateUserForm />
      </section>
    </div>
  );
}
