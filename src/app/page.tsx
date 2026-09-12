import { redirect } from "next/navigation";

import { getCurrentUser } from "@/services/users/current-user.service";
import { getDashboardRoute } from "@/lib/auth/dashboard-route";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.accountStatus === "pending") {
    redirect("/pending-approval");
  }

  if (user.accountStatus === "rejected") {
    redirect("/account-rejected");
  }

  if (user.accountStatus === "suspended") {
    redirect("/account-suspended");
  }

  if (user.accountStatus !== "approved") {
    redirect("/account-inactive");
  }

  redirect(getDashboardRoute(user.roles));
}
