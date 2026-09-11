import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

export async function
getOfferById(
  offerId:
    string
) {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("offers")
      .select(`
        id,
        offer_code,
        application_id,
        student_id,
        job_id,
        company_id,
        designation,
        department,
        employment_type,
        joining_location,
        annual_ctc,
        currency,
        joining_date,
        offer_date,
        offer_valid_until,
        probation_period_months,
        notice_buyout_available,
        notes,
        bucket_name,
        storage_path,
        original_file_name,
        mime_type,
        file_size,
        status,
        uploaded_at,
        sent_to_student_at,
        student_decided_at,
        student_decision_reason,

        companies (
          id,
          name,
          logo
        ),

        jobs (
          id,
          job_code,
          job_title,
          role_type
        )
      `)
      .eq(
        "id",
        offerId
      )
      .single();

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data;
}

export async function
getStudentOffers(
  studentId:
    string
) {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("offers")
      .select(`
        id,
        offer_code,
        application_id,
        designation,
        annual_ctc,
        currency,
        joining_location,
        joining_date,
        offer_date,
        offer_valid_until,
        status,
        uploaded_at,

        companies (
          id,
          name,
          logo
        ),

        jobs (
          id,
          job_title
        )
      `)
      .eq(
        "student_id",
        studentId
      )
      .is(
        "deleted_at",
        null
      )
      .order(
        "uploaded_at",
        {
          ascending:
            false,
        }
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data ?? [];
}