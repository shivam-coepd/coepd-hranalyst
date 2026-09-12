import { requireActiveClientHr } from "@/services/client/client-profile.service";
import { getClientPlacements } from "@/repositories/placements.repository";

export default async function ClientPlacementsPage() {
  const { clientProfile } = await requireActiveClientHr();
  const placements = await getClientPlacements(clientProfile.company_id);
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Placements</h1>
        <p className="mt-1 text-sm text-gray-500">
          Candidates placed with your company.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">CTC</th>
              <th className="px-4 py-3">Joining Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {placements.map((p) => {
              const student = Array.isArray(p.student_profiles)
                ? p.student_profiles[0]
                : p.student_profiles;
              return (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    {[student?.first_name, student?.last_name]
                      .filter(Boolean)
                      .join(" ")}
                  </td>
                  <td className="px-4 py-3">{p.placed_designation}</td>
                  <td className="px-4 py-3">
                    {p.annual_ctc != null
                      ? `${p.currency} ${Number(p.annual_ctc).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{p.joining_date ?? "—"}</td>
                  <td className="px-4 py-3 capitalize">{p.placement_status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {placements.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No placements yet.
          </div>
        )}
      </div>
    </div>
  );
}
