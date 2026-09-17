import { getCurrentUser } from "@/services/users/current-user.service";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/logout";

export default async function PendingApprovalPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.accountStatus === "approved") {
    redirect("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
          ⏳
        </div>

        <h1 className="text-2xl font-semibold">Account pending approval</h1>

        <p className="mt-3 text-muted-foreground">
          Your HRAnalyst Placement account has been created successfully and is
          currently awaiting administrator approval.
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          Registered email: {user.email}
        </p>

        <form action={logoutAction}>
          <button
            type="submit"
            className="mt-7 rounded-lg border px-5 py-2.5 font-medium"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
