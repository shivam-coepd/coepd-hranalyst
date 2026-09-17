import { requireRole } from "@/lib/auth/guards";
import JobForm from "@/components/jobs/job-form";
import { getVerifiedActiveCompanies } from "@/repositories/companies.repository";
import { getPlacementHrOptions } from "@/repositories/jobs.repository";
import { createJobAction } from "./actions";
export default async function Page() {
  const u = await requireRole(["placement_hr", "admin", "super_admin"]);
  const [c, h] = await Promise.all([
    getVerifiedActiveCompanies(),
    getPlacementHrOptions(),
  ]);
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-bold">Create job</h1>
      {c.length ? (
        <JobForm
          action={createJobAction}
          companies={c}
          placementHrs={h}
          lockedPlacementHrId={u.roles.includes("placement_hr") && !u.roles.some((r) => r === "admin" || r === "super_admin") ? u.id : undefined}
          defaults={{
            assignedPlacementHr: u.roles.includes("placement_hr") ? u.id : "",
          }}
        />
      ) : (
        <p className="mt-6">No verified active company is available.</p>
      )}
    </main>
  );
}
