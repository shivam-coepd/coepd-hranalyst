import { requireRole } from "@/lib/auth/guards";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["client_hr", "admin", "super_admin"]);

  return children;
}
