import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { getMockDetail } from "@/repositories/mocks.repository";
import { MockScorecardForm } from "@/components/mocks/mock-scorecard-form";
export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const u = await requireRole(["placement_hr", "admin", "super_admin"]);
  const { id } = await params;
  const m = await getMockDetail(id);
  if (!m) notFound();
  const job = Array.isArray(m.applications?.jobs)
    ? m.applications.jobs[0]
    : m.applications?.jobs;
  const can =
    u.roles.some((r) => r === "admin" || r === "super_admin") ||
    m.evaluator_user_id === u.id ||
    job?.assigned_placement_hr === u.id;
  if (!can) notFound();
  const rawSc = m.mock_scorecards;
  const scList = Array.isArray(rawSc) ? rawSc : (rawSc ? [rawSc] : []);
  const cards = [...scList].sort(
    (a: any, b: any) =>
      parseInt(b.scoring_version || "0") - parseInt(a.scoring_version || "0"),
  );
  const profile = "profile" in m ? m.profile : null;
  return (
    <main className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{m.mock_code}</h1>
        <p className="text-gray-500">
          {profile?.first_name} {profile?.last_name} · {job?.job_title}
        </p>
      </div>
      <div className="grid gap-4 rounded-xl border p-5 md:grid-cols-4">
        <div>
          <span className="text-xs text-gray-500">Schedule</span>
          <p>{new Date(m.scheduled_at).toLocaleString()}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Mode</span>
          <p className="capitalize">{m.mode}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Status</span>
          <p className="capitalize">{m.status}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Duration</span>
          <p>{m.duration_minutes} min</p>
        </div>
      </div>
      {m.meeting_link && (
        <a
          className="underline"
          href={m.meeting_link}
          target="_blank"
          rel="noreferrer"
        >
          Open meeting link
        </a>
      )}
      {m.status !== "cancelled" && m.status !== "no_show" && (
        <MockScorecardForm mockId={m.id} />
      )}
      <section className="space-y-3">
        <h2 className="font-semibold">Scorecard History</h2>
        {cards.map((c) => (
          <article key={c.id} className="rounded-xl border p-4">
            <div className="flex justify-between">
              <strong>Version {c.version}</strong>
              <span className="capitalize">{c.status}</span>
            </div>
            <p className="mt-2">
              Communication {c.communication_score} · Technical{" "}
              {c.technical_score} · Domain {c.domain_score} ·{" "}
              <strong>Overall {c.overall_score}</strong>
            </p>
            <p className="mt-2 text-sm">
              {c.recommendation.replaceAll("_", " ")}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
