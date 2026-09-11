import { redirect } from "next/navigation";

export default function PendingUsersPage() {
  redirect("/admin/users?status=pending");
}