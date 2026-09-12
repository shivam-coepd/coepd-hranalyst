import { requireRole } from "@/lib/auth/guards";

import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function PlacementHrInterviewsPage() {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);

  let query = supabaseAdmin
    .from("interviews")
    .select(
      `
        id,
        interview_code,
        round_name,
        scheduled_at,
        mode,
        status,

        jobs!inner (
          job_title,
          assigned_placement_hr
        ),

        companies (
          name
        ),

        submission_candidates (
          candidate_snapshot
        )
      `,
    )
    .is("deleted_at", null);

  if (!user.roles.some((role) => role === "admin" || role === "super_admin")) {
    query = query.eq("jobs.assigned_placement_hr", user.id);
  }

  const { data, error } = await query.order("scheduled_at", {
    ascending: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const interviews = data ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Client Interviews</h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor all scheduled candidate interviews.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Job</th>
              <th className="px-4 py-3">Round</th>
              <th className="px-4 py-3">Schedule</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {interviews.map((interview) => {
              const candidate = Array.isArray(interview.submission_candidates)
                ? interview.submission_candidates[0]
                : interview.submission_candidates;

              const snapshot = candidate?.candidate_snapshot as
                Record<string, unknown> | undefined;

              const company = Array.isArray(interview.companies)
                ? interview.companies[0]
                : interview.companies;

              const job = Array.isArray(interview.jobs)
                ? interview.jobs[0]
                : interview.jobs;

              return (
                <tr key={interview.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    {String(snapshot?.candidate_name ?? "Candidate")}
                  </td>

                  <td className="px-4 py-3">{company?.name}</td>

                  <td className="px-4 py-3">{job?.job_title}</td>

                  <td className="px-4 py-3">{interview.round_name}</td>

                  <td className="px-4 py-3">
                    {new Date(interview.scheduled_at).toLocaleString()}
                  </td>

                  <td className="px-4 py-3 capitalize">{interview.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
