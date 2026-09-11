import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  buildCsv,
} from "@/lib/reports/csv";

export async function
buildPlacementsCsv() {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("placements")
      .select(`
        placement_code,
        placed_designation,
        joining_location,
        annual_ctc,
        currency,
        joining_date,
        placement_status,
        placed_at,

        companies (
          name
        ),

        student_profiles (
          first_name,
          last_name,
          enrollment_id
        ),

        jobs (
          job_code,
          job_title
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

  const rows =
    (data ?? [])
      .map(
        placement => {

          const company =
            Array.isArray(
              placement.companies
            )
              ? placement
                  .companies[0]
              : placement
                  .companies;

          const student =
            Array.isArray(
              placement
                .student_profiles
            )
              ? placement
                  .student_profiles[0]
              : placement
                  .student_profiles;

          const job =
            Array.isArray(
              placement.jobs
            )
              ? placement
                  .jobs[0]
              : placement.jobs;

          return {
            PlacementCode:
              placement
                .placement_code,

            EnrollmentId:
              student
                ?.enrollment_id ??
              "",

            Candidate:
              [
                student
                  ?.first_name,
                student
                  ?.last_name,
              ]
                .filter(
                  Boolean
                )
                .join(" "),

            Company:
              company?.name ??
              "",

            JobCode:
              job?.job_code ??
              "",

            JobTitle:
              job?.job_title ??
              "",

            Designation:
              placement
                .placed_designation,

            Location:
              placement
                .joining_location ??
              "",

            AnnualCTC:
              placement
                .annual_ctc ??
              "",

            Currency:
              placement
                .currency,

            JoiningDate:
              placement
                .joining_date ??
              "",

            Status:
              placement
                .placement_status,

            PlacedAt:
              placement
                .placed_at,
          };
        }
      );

  return buildCsv(
    rows
  );
}


export async function
buildApplicationsCsv() {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "applications"
      )
      .select(`
        id,
        status,
        match_score,
        verified_match_score,
        ats_score,
        verified_ats_score,
        created_at,
        submitted_to_client_at,
        shortlisted_at,
        selected_at,
        offer_received_at,
        placed_at,

        student_profiles (
          enrollment_id,
          first_name,
          last_name
        ),

        jobs (
          job_code,
          job_title
        )
      `)
      .order(
        "created_at",
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

  return buildCsv(
    (data ?? [])
      .map(
        application => {

          const student =
            Array.isArray(
              application
                .student_profiles
            )
              ? application
                  .student_profiles[0]
              : application
                  .student_profiles;

          const job =
            Array.isArray(
              application.jobs
            )
              ? application
                  .jobs[0]
              : application.jobs;

          return {
            ApplicationId:
              application.id,

            EnrollmentId:
              student
                ?.enrollment_id ??
              "",

            Candidate:
              [
                student
                  ?.first_name,
                student
                  ?.last_name,
              ]
                .filter(
                  Boolean
                )
                .join(" "),

            JobCode:
              job?.job_code ??
              "",

            JobTitle:
              job?.job_title ??
              "",

            Status:
              application.status,

            MatchScore:
              application
                .verified_match_score
              ??
              application
                .match_score
              ??
              "",

            ATSScore:
              application
                .verified_ats_score
              ??
              application
                .ats_score
              ??
              "",

            AppliedAt:
              application
                .created_at,

            SubmittedAt:
              application
                .submitted_to_client_at
              ??
              "",

            ShortlistedAt:
              application
                .shortlisted_at
              ??
              "",

            SelectedAt:
              application
                .selected_at
              ??
              "",

            OfferReceivedAt:
              application
                .offer_received_at
              ??
              "",

            PlacedAt:
              application
                .placed_at
              ??
              "",
          };
        }
      )
  );
}


export async function
buildFeedbackSlaCsv() {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "analytics_feedback_sla"
      )
      .select("*")
      .order(
        "completed_at",
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

  return buildCsv(
    (data ?? [])
      .map(
        row => ({
          InterviewId:
            row.interview_id,

          ApplicationId:
            row.application_id,

          CompletedAt:
            row.completed_at,

          FeedbackSubmittedAt:
            row.submitted_at ??
            "",

          FeedbackDueAt:
            row.feedback_due_at,

          SLAStatus:
            row.sla_status,

          ElapsedHours:
            Number(
              row.elapsed_hours ??
              0
            ).toFixed(
              2
            ),
        })
      )
  );
}