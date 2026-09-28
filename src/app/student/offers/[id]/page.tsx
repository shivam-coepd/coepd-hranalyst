import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { getOfferById } from "@/repositories/offers.repository";

import { OfferFileButton } from "@/components/offers/offer-file-button";

import { StudentOfferActions } from "@/components/offers/student-offer-actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StudentOfferDetailPage({ params }: Props) {
  const user = await requireRole(["student"]);

  const { id } = await params;

  const offer = await getOfferById(id);

  const { data: studentProfile } = await supabaseAdmin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!studentProfile || offer.student_id !== studentProfile.id) {
    notFound();
  }

  const company = Array.isArray(offer.companies)
    ? offer.companies[0]
    : offer.companies;

  return (
    <div className="p-8 space-y-6">
      <div className="rounded-xl border bg-white p-6">
        <p className="text-sm text-gray-500">{offer.offer_code}</p>

        <h1 className="mt-2 text-2xl font-bold">{offer.designation}</h1>

        <p className="mt-1 text-gray-600">{company?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Annual CTC</p>
          <p className="mt-2 text-lg font-semibold">
            {offer.annual_ctc !== null
              ? `${offer.currency} ${Number(offer.annual_ctc).toLocaleString()}`
              : "Not specified"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Joining Date</p>
          <p className="mt-2 text-lg font-semibold">
            {offer.joining_date ?? "Not specified"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Joining Location</p>
          <p className="mt-2 text-lg font-semibold">
            {offer.joining_location ?? "Not specified"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Offer Valid Until</p>
          <p className="mt-2 text-lg font-semibold">
            {offer.offer_valid_until ?? "Not specified"}
          </p>
        </div>
      </div>

      <OfferFileButton offerId={offer.id} />

      <StudentOfferActions offerId={offer.id} status={offer.status} />
    </div>
  );
}
