import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { generateInterviewIcs } from "@/services/interviews/calendar-invite.service";

export async function getCalendarInviteForOutbox({
  eventType,
  entityId,
}: {
  eventType: string;
  entityId: string | null;
}) {
  if (
    !entityId ||
    !["CLIENT_INTERVIEW_SCHEDULED", "CLIENT_INTERVIEW_RESCHEDULED"].includes(
      eventType,
    )
  ) {
    return null;
  }

  const { data: interview, error } = await supabaseAdmin
    .from("interviews")
    .select(
      `
        id,
        interview_code,
        round_name,
        scheduled_at,
        duration_minutes,
        mode,
        location,
        meeting_link,

        jobs (
          job_title
        )
      `,
    )
    .eq("id", entityId)
    .single();

  if (error || !interview) {
    return null;
  }

  const job = Array.isArray(interview.jobs)
    ? interview.jobs[0]
    : interview.jobs;

  return generateInterviewIcs({
    uid: `${interview.interview_code}@hranalyst`,

    title: `${interview.round_name} - ${job?.job_title ?? "Client Interview"}`,

    description: `HRAnalyst client interview: ${interview.round_name}`,

    startAt: new Date(interview.scheduled_at),

    durationMinutes: interview.duration_minutes,

    location: interview.location,

    meetingLink: interview.meeting_link,
  });
}
