import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/dashboard";

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 pt-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">🍞 Japastry</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Sign in to manage inventory and production
        </p>
      </div>
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
