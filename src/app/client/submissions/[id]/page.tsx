import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActiveClientHr } from "@/services/client/client-profile.service";
import { getSubmission } from "@/repositories/submissions.repository";
import { ClientCvButton } from "@/components/submissions/client-cv-button";
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
  const { clientProfile } = await requireActiveClientHr();
  const { id } = await params;
  const s = await getSubmission(id);
  const sub = s;
  if (
    !sub ||
    sub.company_id !== clientProfile.company_id ||
    sub.status === "cancelled"
  )
    notFound();
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="rounded-xl border bg-white p-6">
        <p className="text-sm text-gray-500">{sub.submission_code}</p>
        <h1 className="text-2xl font-bold">{sub.jobs?.job_title}</h1>
        <p>{sub.candidate_count} submitted candidates</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(sub.submission_candidates ?? []).map((c) => {
          const x = snapshot(c.candidate_snapshot);
          return (
            <div key={c.id} className="rounded-xl border bg-white p-5">
              <h2 className="font-semibold">
                {x.candidate_name || "Candidate"}
              </h2>
              <p className="text-sm text-gray-600">
                {x.current_designation || ""}{" "}
                {x.current_company ? `at ${x.current_company}` : ""}
              </p>
              <div className="mt-3 text-sm">
                Match <b>{c.submitted_match_score}%</b> · ATS{" "}
                <b>{c.submitted_ats_score ?? "—"}%</b>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  className="rounded bg-black px-3 py-2 text-sm text-white"
                  href={`/client/candidates/${c.id}`}
                >
                  Review
                </Link>
                <ClientCvButton candidateId={c.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
