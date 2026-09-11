import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

export async function
getPlacementById(
  placementId:
    string
) {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("placements")
      .select(`
        id,
        placement_code,
        application_id,
        offer_id,
        student_id,
        job_id,
        company_id,
        placed_designation,
        placed_department,
        joining_location,
        annual_ctc,
        currency,
        joining_date,
        placement_status,
        placed_at,
        joined_at,
        closed_at,
        closure_reason,
        notes,

        companies (
          id,
          name,
          logo
        ),

        jobs (
          id,
          job_code,
          job_title
        ),

        student_profiles (
          id,
          first_name,
          last_name
        ),

        placement_status_history (
          id,
          old_status,
          new_status,
          reason,
          changed_at
        )
      `)
      .eq(
        "id",
        placementId
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
getAllPlacements() {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("placements")
      .select(`
        id,
        placement_code,
        placed_designation,
        annual_ctc,
        currency,
        joining_date,
        placement_status,
        placed_at,

        companies (
          name
        ),

        jobs (
          job_title
        ),

        student_profiles (
          first_name,
          last_name
        )
      `)
      .order(
        "placed_at",
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