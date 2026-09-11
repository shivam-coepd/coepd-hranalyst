import "server-only";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  requireRole,
} from "@/lib/auth/guards";

import {
  registerOfferSchema,
  studentOfferDecisionSchema,
  type RegisterOfferInput,
  type StudentOfferDecisionInput,
} from "@/lib/validators/offer.schema";

import {
  uploadOfferFile,
  deleteOfferFile,
} from "./offer-file.service";

export async function
registerOffer({
  input,
  file,
}: {
  input:
    RegisterOfferInput;
  file:
    File;
}) {

  await requireRole([
    "placement_hr",
    "admin",
    "super_admin",
  ]);

  const parsed =
    registerOfferSchema
      .parse(input);

  const uploaded =
    await uploadOfferFile({
      applicationId:
        parsed.applicationId,
      file,
    });

  try {

    const supabase =
      await createClient();

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "register_offer",
        {
          p_application_id:
            parsed.applicationId,

          p_feedback_id:
            parsed.feedbackId,

          p_designation:
            parsed.designation,

          p_department:
            parsed.department ??
            null,

          p_employment_type:
            parsed.employmentType ??
            null,

          p_joining_location:
            parsed.joiningLocation ??
            null,

          p_annual_ctc:
            parsed.annualCtc ??
            null,

          p_currency:
            parsed.currency,

          p_joining_date:
            parsed.joiningDate ??
            null,

          p_offer_date:
            parsed.offerDate ??
            null,

          p_offer_valid_until:
            parsed.offerValidUntil ??
            null,

          p_probation_period_months:
            parsed.probationPeriodMonths ??
            null,

          p_notice_buyout_available:
            parsed.noticeBuyoutAvailable ??
            null,

          p_notes:
            parsed.notes ??
            null,

          p_bucket_name:
            uploaded.bucketName,

          p_storage_path:
            uploaded.storagePath,

          p_original_file_name:
            uploaded.originalFileName,

          p_mime_type:
            uploaded.mimeType,

          p_file_size:
            uploaded.fileSize,

          p_file_hash:
            uploaded.fileHash,
        }
      );

    if (error) {
      throw new Error(
        error.message
      );
    }

    return {
      offerId:
        data as string,
    };

  } catch (error) {

    await deleteOfferFile(
      uploaded.storagePath
    );

    throw error;
  }
}

export async function
decideOffer(
  input:
    StudentOfferDecisionInput
) {

  await requireRole([
    "student",
  ]);

  const parsed =
    studentOfferDecisionSchema
      .parse(input);

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "student_decide_offer",
      {
        p_offer_id:
          parsed.offerId,

        p_decision:
          parsed.decision,

        p_reason:
          parsed.reason ??
          null,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return {
    placementId:
      data as
        | string
        | null,
  };
}