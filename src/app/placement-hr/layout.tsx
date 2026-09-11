import { requireRole } from "@/lib/auth/guards";

export default async function PlacementHRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole([
    "placement_hr",
    "admin",
    "super_admin",
  ]);

  return children;
}