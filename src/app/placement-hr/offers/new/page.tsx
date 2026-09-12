import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { OfferUploadForm } from "@/components/offers/offer-upload-form";

type Props = {
  searchParams: Promise<{
    applicationId?: string;
    feedbackId?: string;
  }>;
};

export default async function NewOfferPage({ searchParams }: Props) {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);

  const params = await searchParams;

  if (!params.applicationId || !params.feedbackId) {
    redirect("/placement-hr/interviews");
  }

  const { data: application } = await supabaseAdmin
    .from("applications")
    .select(
      `
        id,
        status,

        student_profiles (
          first_name,
          last_name
        ),

        jobs!inner (
          job_title,
          assigned_placement_hr
        )
      `,
    )
    .eq("id", params.applicationId)
    .single();

  const job = Array.isArray(application?.jobs)
    ? application.jobs[0]
    : application?.jobs;
  const isAdmin = user.roles.some(
    (role) => role === "admin" || role === "super_admin",
  );
  if (
    !application ||
    application.status !== "selected" ||
    (!isAdmin && job?.assigned_placement_hr !== user.id)
  ) {
    redirect("/placement-hr/interviews");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Create Offer</h1>

        <p className="mt-1 text-sm text-gray-500">
          Upload the official offer for the selected candidate.
        </p>
      </div>

      <OfferUploadForm
        applicationId={params.applicationId}
        feedbackId={params.feedbackId}
      />
    </div>
  );
}
