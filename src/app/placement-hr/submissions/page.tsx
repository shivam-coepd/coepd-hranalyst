import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { listPlacementSubmissions } from "@/repositories/submissions.repository";
export default async function Page() {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);
  const rows = await listPlacementSubmissions(
    user.id,
    user.roles.some((r) => r === "admin" || r === "super_admin"),
  );
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Client Submissions</h1>
        <p className="text-gray-600">
          Verified candidates submitted to Client HR.
        </p>
      </div>
      <div className="space-y-3">
        {rows.map((r) => (
          <Link
            key={r.id}
            href={`/placement-hr/submissions/${r.id}`}
            className="block rounded-xl border bg-white p-5"
          >
            <b>{r.submission_code}</b>
            <div>
              {r.jobs?.job_title} · {r.companies?.name}
            </div>
            <div className="text-sm text-gray-500">
              {r.candidate_count} candidates · {r.status}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
