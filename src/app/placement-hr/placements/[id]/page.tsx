import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";

import { getPlacementById } from "@/repositories/placements.repository";

import { PlacementActions } from "@/components/placements/placement-actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlacementDetailPage({ params }: Props) {
  await requireRole(["placement_hr", "admin", "super_admin"]);

  const { id } = await params;

  const placement = await getPlacementById(id);

  if (!placement) {
    notFound();
  }

  const company = Array.isArray(placement.companies)
    ? placement.companies[0]
    : placement.companies;

  const student = Array.isArray(placement.student_profiles)
    ? placement.student_profiles[0]
    : placement.student_profiles;

  return (
    <div className="p-8 space-y-6">
      <div className="rounded-xl border bg-white p-6">
        <p className="text-sm text-gray-500">{placement.placement_code}</p>

        <h1 className="mt-2 text-2xl font-bold">
          {[student?.first_name, student?.last_name].filter(Boolean).join(" ")}
        </h1>

        <p className="mt-1 text-gray-600">{company?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Designation</p>
          <p className="mt-2 font-semibold">{placement.placed_designation}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Placement Status</p>
          <p className="mt-2 font-semibold capitalize">
            {placement.placement_status}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Annual CTC</p>
          <p className="mt-2 font-semibold">
            {placement.annual_ctc !== null
              ? `${placement.currency} ${Number(
                  placement.annual_ctc,
                ).toLocaleString()}`
              : "—"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Joining Date</p>
          <p className="mt-2 font-semibold">{placement.joining_date ?? "—"}</p>
        </div>
      </div>

      <PlacementActions
        placementId={placement.id}
        status={placement.placement_status}
      />

      <div className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Placement Timeline</h2>

        <div className="mt-4 space-y-4">
          {(placement.placement_status_history ?? [])
            .slice()
            .sort(
              (a, b) =>
                new Date(a.changed_at).getTime() -
                new Date(b.changed_at).getTime(),
            )
            .map((history) => (
              <div key={history.id} className="border-l-2 pl-4">
                <p className="font-medium capitalize">{history.new_status}</p>

                <p className="text-sm text-gray-500">
                  {new Date(history.changed_at).toLocaleString()}
                </p>

                {history.reason && (
                  <p className="mt-1 text-sm">{history.reason}</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
