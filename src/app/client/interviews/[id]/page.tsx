import { notFound } from "next/navigation";

import { requireActiveClientHr } from "@/services/client/client-profile.service";

import { getInterviewById } from "@/repositories/interviews.repository";

import { InterviewFeedbackForm } from "@/components/feedbacks/interview-feedback-form";

import { CompleteInterviewButton } from "@/components/interviews/complete-interview-button";

import { getFeedbackByInterviewId } from "@/repositories/feedbacks.repository";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClientInterviewDetailPage({ params }: Props) {
  const { id } = await params;

  const { clientProfile } = await requireActiveClientHr();

  const interview = await getInterviewById(id);

  if (!interview || interview.company_id !== clientProfile.company_id) {
    notFound();
  }

  const feedback = await getFeedbackByInterviewId(id);

  const candidate = Array.isArray(interview.submission_candidates)
    ? interview.submission_candidates[0]
    : interview.submission_candidates;

  const snapshot = candidate?.candidate_snapshot as
    Record<string, unknown> | undefined;

  return (
    <div className="p-8 space-y-6">
      <div className="rounded-xl border bg-white p-6">
        <p className="text-sm text-gray-500">{interview.interview_code}</p>

        <h1 className="mt-2 text-2xl font-bold">{interview.round_name}</h1>

        <p className="mt-1 text-gray-600">
          {String(snapshot?.candidate_name ?? "Candidate")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Scheduled</p>
          <p className="mt-2 font-medium">
            {new Date(interview.scheduled_at).toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Status</p>
          <p className="mt-2 font-medium capitalize">{interview.status}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Mode</p>
          <p className="mt-2 font-medium capitalize">{interview.mode}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Duration</p>
          <p className="mt-2 font-medium">
            {interview.duration_minutes} minutes
          </p>
        </div>
      </div>

      {interview.mode === "online" && interview.meeting_link && (
        <a
          href={interview.meeting_link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white"
        >
          Open Meeting
        </a>
      )}

      {interview.mode === "offline" && (
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Location</p>
          <p className="mt-2">{interview.location}</p>
        </div>
      )}

      {interview.instructions && (
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Instructions</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
            {interview.instructions}
          </p>
        </div>
      )}

      {interview.status === "completed" && (
        <>
          {feedback ? (
            <div className="rounded-xl border bg-white p-6">
              <h2 className="text-lg font-semibold">Feedback Submitted</h2>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Decision</dt>
                  <dd className="font-medium capitalize">
                    {feedback.decision}
                  </dd>
                </div>

                <div>
                  <dt className="text-gray-500">Rating</dt>
                  <dd className="font-medium">{feedback.rating ?? "—"}</dd>
                </div>

                <div>
                  <dt className="text-gray-500">Comments</dt>
                  <dd className="whitespace-pre-wrap">
                    {feedback.comments ?? "—"}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <InterviewFeedbackForm interviewId={interview.id} />
          )}
        </>
      )}

      {(interview.status === "scheduled" || interview.status === "in_progress") && (
        <div className="rounded-xl border bg-white p-6 mt-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Complete Interview</h2>
            <p className="text-sm text-gray-500 mt-1">Once the interview has concluded, mark it as completed to unlock the feedback form.</p>
          </div>
          <CompleteInterviewButton interviewId={interview.id} />
        </div>
      )}
    </div>
  );
}
