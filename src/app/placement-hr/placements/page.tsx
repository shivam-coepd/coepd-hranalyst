import Link from "next/link";

import { requireRole } from "@/lib/auth/guards";

import { getAllPlacements } from "@/repositories/placements.repository";

export default async function PlacementsPage() {
  await requireRole(["placement_hr", "admin", "super_admin"]);

  const placements = await getAllPlacements();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Placements</h1>

        <p className="mt-1 text-sm text-gray-500">
          Track placed candidates, joining and closure.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">CTC</th>
              <th className="px-4 py-3">Joining Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>

          <tbody>
            {placements.map((placement) => {
              const student = Array.isArray(placement.student_profiles)
                ? placement.student_profiles[0]
                : placement.student_profiles;

              const company = Array.isArray(placement.companies)
                ? placement.companies[0]
                : placement.companies;

              return (
                <tr key={placement.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    {[student?.first_name, student?.last_name]
                      .filter(Boolean)
                      .join(" ")}
                  </td>

                  <td className="px-4 py-3">{company?.name}</td>

                  <td className="px-4 py-3">{placement.placed_designation}</td>

                  <td className="px-4 py-3">
                    {placement.annual_ctc !== null
                      ? `${placement.currency} ${Number(
                          placement.annual_ctc,
                        ).toLocaleString()}`
                      : "—"}
                  </td>

                  <td className="px-4 py-3">{placement.joining_date ?? "—"}</td>

                  <td className="px-4 py-3 capitalize">
                    {placement.placement_status}
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/placement-hr/placements/${placement.id}`}
                      className="font-medium underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
