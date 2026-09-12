import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  listAvailableMockSlots,
  listStudentMockApplications,
  listStudentMocks,
} from "@/repositories/mocks.repository";
import { StudentBookingPanel } from "@/components/mocks/student-booking-panel";
export default async function Page() {
  const user = await requireRole("student");
  const { data: studentProfile } = await supabaseAdmin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!studentProfile) throw new Error("Student profile not found");
  const [applications, slots, mocks] = await Promise.all([
    listStudentMockApplications(studentProfile.id),
    listAvailableMockSlots(),
    listStudentMocks(studentProfile.id),
  ]);
  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">Mock Interviews</h1>
        <p className="text-sm text-gray-500">
          Book an available mock and review submitted scorecards.
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-semibold">Available slots</h2>
        <StudentBookingPanel applications={applications} slots={slots} />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">My mocks</h2>
        {mocks.map((mock) => {
          const job = Array.isArray(mock.applications?.jobs)
            ? mock.applications.jobs[0]
            : mock.applications?.jobs;
          const cards = [...(mock.mock_scorecards ?? [])].sort(
            (a, b) =>
              parseInt(b.scoring_version || "0") -
              parseInt(a.scoring_version || "0"),
          );
          const scorecard = cards.find((x) => x.status === "submitted");
          return (
            <article key={mock.id} className="rounded-xl border p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <strong>{job?.job_title}</strong>
                  <p className="text-sm text-gray-500">
                    {mock.mock_code} ·{" "}
                    {new Date(mock.scheduled_at).toLocaleString()}
                  </p>
                </div>
                <span className="capitalize">
                  {mock.status.replaceAll("_", " ")}
                </span>
              </div>
              {mock.mode === "online" && mock.meeting_link && (
                <a
                  href={mock.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block underline"
                >
                  Join mock
                </a>
              )}
              {mock.mode === "offline" && mock.location && (
                <p className="mt-3 text-sm">Location: {mock.location}</p>
              )}
              {scorecard && (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <p>
                    <strong>Overall score: {scorecard.overall_score}</strong>
                  </p>
                  <p className="text-sm">
                    Communication {scorecard.communication_score} · Technical{" "}
                    {scorecard.technical_score} · Domain{" "}
                    {scorecard.domain_score}
                  </p>
                  {scorecard.student_visible_notes && (
                    <p className="mt-2 text-sm">
                      {scorecard.student_visible_notes}
                    </p>
                  )}
                  <p className="mt-2 text-sm capitalize">
                    Recommendation:{" "}
                    {scorecard.recommendation.replaceAll("_", " ")}
                  </p>
                </div>
              )}
            </article>
          );
        })}
        {mocks.length === 0 && (
          <p className="text-sm text-gray-500">No mocks yet.</p>
        )}
      </section>
    </main>
  );
}
