import Link from "next/link";
import { requireActiveClientHr } from "@/services/client/client-profile.service";
import { listClientSubmissions } from "@/repositories/submissions.repository";
export default async function Page() {
  const { clientProfile } = await requireActiveClientHr();
  const rows = await listClientSubmissions(clientProfile.company_id);
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Candidate Submissions</h1>
        <p className="text-gray-600">
          Profiles submitted by the Placement team for your jobs.
        </p>
      </div>
      <div className="space-y-3">
        {rows.map((s) => (
          <Link
            key={s.id}
            href={`/client/submissions/${s.id}`}
            className="block rounded-xl border bg-white p-5"
          >
            <b>{s.submission_code}</b>
            <div>{s.jobs?.job_title}</div>
            <div className="text-sm text-gray-500">
              {s.candidate_count} candidates · {s.status}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
