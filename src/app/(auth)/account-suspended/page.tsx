import { logoutAction } from "@/app/actions/logout";

export default function AccountSuspendedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Account suspended</h1>

        <p className="mt-3 text-muted-foreground">
          Access to this account has temporarily been suspended.
        </p>

        <form action={logoutAction}>
          <button className="mt-6 rounded-lg border px-5 py-2.5">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
