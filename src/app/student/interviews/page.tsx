import { requireRole } from "@/lib/auth/guards";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { getStudentInterviews } from "@/repositories/interviews.repository";

export default async function StudentInterviewsPage() {
  const user = await requireRole(["student"]);

  const { data: studentProfile, error } = await supabaseAdmin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (error || !studentProfile) {
    throw new Error("Student profile not found");
  }

  const interviews = await getStudentInterviews(studentProfile.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">My Interviews</h1>

        <p className="mt-1 text-sm text-gray-500">
          View scheduled client interview rounds.
        </p>
      </div>

      <div className="space-y-4">
        {interviews.map((interview) => {
          const company = Array.isArray(interview.companies)
            ? interview.companies[0]
            : interview.companies;

          const job = Array.isArray(interview.jobs)
            ? interview.jobs[0]
            : interview.jobs;

          return (
            <div key={interview.id} className="rounded-xl border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">{company?.name}</p>

                  <h2 className="mt-1 text-lg font-semibold">
                    {job?.job_title}
                  </h2>

                  <p className="mt-1 text-sm">{interview.round_name}</p>
                </div>

                <span className="rounded-full border px-3 py-1 text-xs capitalize">
                  {interview.status}
                </span>
              </div>

              <div className="mt-5 grid gap-4 text-sm md:grid-cols-3">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(interview.scheduled_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Mode</p>
                  <p className="font-medium capitalize">{interview.mode}</p>
                </div>

                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium">
                    {interview.duration_minutes} minutes
                  </p>
                </div>
              </div>

              {interview.mode === "online" && interview.meeting_link && (
                <a
                  href={interview.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
                >
                  Join Interview
                </a>
              )}

              {interview.mode === "offline" && interview.location && (
                <div className="mt-5 rounded-md bg-gray-50 p-3 text-sm">
                  <strong>Location:</strong> {interview.location}
                </div>
              )}
            </div>
          );
        })}

        {interviews.length === 0 && (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
            No interviews scheduled.
          </div>
        )}
      </div>
    </div>
  );
}
