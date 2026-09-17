import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { getOfferById } from "@/repositories/offers.repository";
import { OfferFileButton } from "@/components/offers/offer-file-button";
import { TeamOfferActions } from "@/components/offers/team-offer-actions";

export default async function PlacementOfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);
  const { id } = await params;
  const offer = await getOfferById(id).catch(() => null);
  if (!offer) notFound();
  const job = Array.isArray(offer.jobs) ? offer.jobs[0] : offer.jobs;
  const isAdmin =
    user.roles.includes("admin") || user.roles.includes("super_admin");
  if (!isAdmin && job?.assigned_placement_hr !== user.id) notFound();
  const company = Array.isArray(offer.companies)
    ? offer.companies[0]
    : offer.companies;
  const student = Array.isArray(offer.student_profiles)
    ? offer.student_profiles[0]
    : offer.student_profiles;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="rounded-xl border bg-white p-6">
        <p className="text-sm text-gray-500">{offer.offer_code}</p>
        <h1 className="mt-2 text-2xl font-bold">{offer.designation}</h1>
        <p className="mt-1 text-gray-600">
          {[student?.first_name, student?.last_name].filter(Boolean).join(" ")}{" "}
          · {company?.name}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card label="Status" value={offer.status} />
        <Card
          label="Annual CTC"
          value={
            offer.annual_ctc != null
              ? `${offer.currency} ${Number(offer.annual_ctc).toLocaleString()}`
              : "—"
          }
        />
        <Card label="Joining Date" value={offer.joining_date ?? "—"} />
        <Card
          label="Offer Valid Until"
          value={offer.offer_valid_until ?? "—"}
        />
      </div>
      <OfferFileButton offerId={offer.id} />
      <TeamOfferActions offerId={offer.id} status={offer.status} />
      <div className="rounded-xl border bg-white p-6">
        <h2 className="font-semibold">Offer Timeline</h2>
        <div className="mt-4 space-y-3">
          {(offer.offer_status_history ?? [])
            .slice()
            .sort(
              (a, b) =>
                new Date(a.changed_at).getTime() -
                new Date(b.changed_at).getTime(),
            )
            .map((h) => (
              <div key={h.id} className="border-l-2 pl-4">
                <p className="font-medium capitalize">{h.new_status}</p>
                <p className="text-xs text-gray-500">
                  {new Date(h.changed_at).toLocaleString()}
                </p>
                {h.reason && <p className="text-sm">{h.reason}</p>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 font-semibold capitalize">{value}</p>
    </div>
  );
}
