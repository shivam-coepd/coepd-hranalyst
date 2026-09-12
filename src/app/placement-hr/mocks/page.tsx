import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import {
  listPlacementMocks,
  listPlacementMockApplications,
  listMockEvaluators,
} from "@/repositories/mocks.repository";
import { ScheduleMockForm } from "@/components/mocks/schedule-mock-form";
import { CreateMockSlotForm } from "@/components/mocks/create-slot-form";
export default async function Page() {
  const u = await requireRole(["placement_hr", "admin", "super_admin"]);
  const admin = u.roles.some((r) => r === "admin" || r === "super_admin");
  const [mocks, apps, evals] = await Promise.all([
    listPlacementMocks(u.id, admin),
    listPlacementMockApplications(u.id, admin),
    listMockEvaluators(),
  ]);
  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Mock Interviews</h1>
        <p className="text-sm text-gray-500">
          Schedule mocks, publish bookable slots, and submit scorecards.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ScheduleMockForm applications={apps} evaluators={evals} />
        <CreateMockSlotForm evaluators={evals} />
      </div>
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Mock</th>
              <th className="p-3">Schedule</th>
              <th className="p-3">Status</th>
              <th className="p-3">Score</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {mocks.map((m) => {
              const sc = [...(m.mock_scorecards ?? [])]
                .sort(
                  (a, b) =>
                    parseInt(b.scoring_version || "0") -
                    parseInt(a.scoring_version || "0"),
                )
                .find((x) => x.status === "submitted");
              return (
                <tr key={m.id} className="border-t">
                  <td className="p-3 font-medium">{m.mock_code}</td>
                  <td className="p-3">
                    {new Date(m.scheduled_at).toLocaleString()}
                  </td>
                  <td className="p-3 capitalize">
                    {m.status.replaceAll("_", " ")}
                  </td>
                  <td className="p-3">{sc?.overall_score ?? "—"}</td>
                  <td className="p-3">
                    <Link
                      className="underline"
                      href={`/placement-hr/mocks/${m.id}`}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
