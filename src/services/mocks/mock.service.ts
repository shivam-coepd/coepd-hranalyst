import "server-only";
import { createClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/http/route-error";
import { buildMockScore } from "@/services/mocks/mock-score.service";
import {
  createMockSchema,
  createMockSlotSchema,
} from "@/lib/validators/mock.schema";
import { mockScorecardSchema } from "@/lib/validators/mock-scorecard.schema";
async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const supabase = await createClient();
  const call = supabase.rpc as unknown as (
    rpcName: string,
    rpcArgs: Record<string, unknown>,
  ) => Promise<{ data: T; error: { message: string } | null }>;
  const { data, error } = await call(name, args);
  if (error) throw new AppError(error.message, 422, "MOCK_OPERATION_FAILED");
  return data;
}
export async function createMockAvailabilitySlot(input: unknown) {
  const v = createMockSlotSchema.parse(input);
  return rpc<string>("create_mock_slot", {
    p_evaluator_user_id: v.evaluatorUserId,
    p_starts_at: v.scheduledAt,
    p_duration_minutes: v.durationMinutes,
    p_mode: v.mode,
    p_meeting_link: v.meetingLink ?? null,
    p_location: v.location ?? null,
  });
}
export async function scheduleMockInterview(input: unknown) {
  const v = createMockSchema.parse(input);
  return rpc<string>("schedule_mock_interview", {
    p_application_id: v.applicationId,
    p_evaluator_user_id: v.evaluatorUserId,
    p_scheduled_at: v.scheduledAt,
    p_duration_minutes: v.durationMinutes,
    p_mode: v.mode,
    p_meeting_link: v.meetingLink ?? null,
    p_location: v.location ?? null,
  });
}
export async function bookMockSlot(applicationId: string, slotId: string) {
  return rpc<string>("book_mock_slot", {
    p_application_id: applicationId,
    p_slot_id: slotId,
  });
}
export async function cancelMockInterview(mockId: string, reason: string) {
  if (!reason.trim())
    throw new AppError(
      "Cancellation reason is required",
      422,
      "VALIDATION_ERROR",
    );
  await rpc("cancel_mock_interview", {
    p_mock_id: mockId,
    p_reason: reason.trim(),
  });
}
export async function startMockInterview(mockId: string) {
  await rpc("start_mock_interview", { p_mock_id: mockId });
}
export async function submitMockScorecard(input: unknown) {
  const v = mockScorecardSchema.parse(input);
  const score = buildMockScore(v);
  return rpc<string>("submit_mock_scorecard", {
    p_mock_id: v.mockId,
    p_communication: score.communicationScore,
    p_technical: score.technicalScore,
    p_domain: score.domainScore,
    p_overall: score.overallScore,
    p_strengths: v.strengths ?? null,
    p_improvement_areas: v.improvementAreas ?? null,
    p_evaluator_notes: v.evaluatorNotes ?? null,
    p_student_visible_notes: v.studentVisibleNotes ?? null,
    p_recommendation: v.recommendation,
    p_scoring_version: score.scoringVersion,
  });
}
