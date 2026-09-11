import {
  redirect,
} from "next/navigation";

import {
  requireRole,
} from "@/lib/auth/guards";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  OfferUploadForm,
} from "@/components/offers/offer-upload-form";

type Props = {
  searchParams:
    Promise<{
      applicationId?:
        string;
      feedbackId?:
        string;
    }>;
};

export default async function
NewOfferPage({
  searchParams,
}: Props) {

  await requireRole([
    "placement_hr",
    "admin",
    "super_admin",
  ]);

  const params =
    await searchParams;

  if (
    !params.applicationId ||
    !params.feedbackId
  ) {
    redirect(
      "/placement-hr/interviews"
    );
  }

  const {
    data: application,
  } =
    await supabaseAdmin
      .from("applications")
      .select(`
        id,
        status,

        student_profiles (
          first_name,
          last_name
        ),

        jobs (
          job_title
        )
      `)
      .eq(
        "id",
        params.applicationId
      )
      .single();

  if (
    !application ||
    application.status !==
      "selected"
  ) {
    redirect(
      "/placement-hr/interviews"
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">

      <div>
        <h1 className="text-2xl font-bold">
          Create Offer
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Upload the official offer for the selected candidate.
        </p>
      </div>

      <OfferUploadForm
        applicationId={
          params.applicationId
        }
        feedbackId={
          params.feedbackId
        }
      />

    </div>
  );
}