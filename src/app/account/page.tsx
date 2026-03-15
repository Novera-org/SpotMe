import { requireAuth } from "@/lib/auth/helpers";
import SignOutButton from "@/components/shared/sign-out-button";

export default async function AccountPage() {
  const session = await requireAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Welcome, {session.user.name || "User"}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {session.user.email}
        </p>
        <div className="pt-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
