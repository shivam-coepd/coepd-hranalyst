import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudentPlacements } from "@/repositories/placements.repository";

export default async function StudentPlacementsPage() {
  const user = await requireRole("student");
  const { data: student } = await supabaseAdmin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  const placements = student ? await getStudentPlacements(student.id) : [];
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">My Placements</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track placement confirmation and joining status.
        </p>
      </div>
      <div className="grid gap-4">
        {placements.map((p) => {
          const company = Array.isArray(p.companies)
            ? p.companies[0]
            : p.companies;
          return (
            <div key={p.id} className="rounded-xl border bg-white p-5">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">{company?.name}</p>
                  <h2 className="mt-1 font-semibold">{p.placed_designation}</h2>
                  <p className="mt-1 text-sm">
                    {p.annual_ctc != null
                      ? `${p.currency} ${Number(p.annual_ctc).toLocaleString()}`
                      : "CTC not specified"}
                  </p>
                </div>
                <span className="h-fit rounded-full border px-3 py-1 text-xs capitalize">
                  {p.placement_status}
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Joining date: {p.joining_date ?? "Not specified"}
              </p>
            </div>
          );
        })}
        {placements.length === 0 && (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
            No confirmed placements yet.
          </div>
        )}
      </div>
    </div>
  );
}
