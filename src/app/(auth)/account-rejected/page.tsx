import { logoutAction } from "@/app/actions/logout";

export default function RejectedAccountPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Account not approved</h1>

        <p className="mt-3 text-muted-foreground">
          Your account could not be approved for access to the HRAnalyst
          Placement Platform.
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          Contact the HRAnalyst administrator if you believe this decision
          requires review.
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
