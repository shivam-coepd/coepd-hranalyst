import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { getSubmission } from "@/repositories/submissions.repository";
function snapshot(value: unknown): Record<string, string | null> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, string | null>)
    : {};
}
export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);
  const { id } = await params;
  const s = await getSubmission(id);
  if (!s) notFound();
  const sub = s;
  if (
    user.roles.includes("placement_hr") &&
    sub.jobs?.assigned_placement_hr !== user.id
  )
    notFound();
  return (
    <div className="p-8 space-y-6">
      <div className="rounded-xl border bg-white p-6">
        <p className="text-sm text-gray-500">{sub.submission_code}</p>
        <h1 className="text-2xl font-bold">{sub.jobs?.job_title}</h1>
        <p>
          {sub.companies?.name} · {sub.candidate_count} candidates
        </p>
      </div>
      <div className="space-y-3">
        {(sub.submission_candidates ?? []).map((c) => {
          const x = snapshot(c.candidate_snapshot);
          return (
            <div key={c.id} className="rounded-xl border bg-white p-5">
              <b>{x.candidate_name || "Candidate"}</b>
              <p className="text-sm text-gray-600">
                {x.enrollment_id} · Match {c.submitted_match_score}% · ATS{" "}
                {c.submitted_ats_score ?? "—"}%
              </p>
              <p className="text-sm">{c.status}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
