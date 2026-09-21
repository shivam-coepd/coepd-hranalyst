import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { getInterviewById } from "@/repositories/interviews.repository";
import {
  getFeedbackByInterviewId,
  getFeedbackRevisions,
} from "@/repositories/feedbacks.repository";
import { InterviewFeedbackForm } from "@/components/feedbacks/interview-feedback-form";
import { InterviewFeedbackRevisionForm } from "@/components/feedbacks/interview-feedback-revision-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function PlacementInterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);
  const { id } = await params;
  const interview = await getInterviewById(id);
  if (!interview) notFound();
  const job = Array.isArray(interview.jobs)
    ? interview.jobs[0]
    : interview.jobs;
  const isAdmin =
    user.roles.includes("admin") || user.roles.includes("super_admin");
  if (!isAdmin && job?.assigned_placement_hr !== user.id) notFound();
  const feedback = await getFeedbackByInterviewId(id);
  const revisions = feedback ? await getFeedbackRevisions(feedback.id) : [];
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Status" value={interview.status} />
        <Card
          label="Schedule"
          value={new Date(interview.scheduled_at).toLocaleString()}
        />
        <Card label="Mode" value={interview.mode} />
      </div>
      {interview.status === "completed" && !feedback && (
        <InterviewFeedbackForm interviewId={interview.id} />
      )}
      {feedback && (
        <div className="space-y-5 rounded-xl border bg-white p-6">
          <div>
            <h2 className="text-lg font-semibold">Interview Feedback</h2>
            <p className="mt-2 capitalize">
              Decision: <strong>{feedback.decision}</strong>
            </p>
            <p>
              Rating: <strong>{feedback.rating ?? "—"}</strong>
            </p>
            {feedback.comments && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                {feedback.comments}
              </p>
            )}
          </div>
          <InterviewFeedbackRevisionForm
            feedbackId={feedback.id}
            current={{
              rating: feedback.rating,
              decision: feedback.decision as
                "selected" | "rejected" | "on_hold",
              reasonCode: feedback.reason_code,
              comments: feedback.comments,
              visibleToStudent: feedback.client_visible_to_student,
            }}
          />
          {feedback.decision === "selected" && (
            <Link
              className={cn(buttonVariants({ variant: "create" }), "mt-4")}
              href={`/placement-hr/offers/new?applicationId=${interview.application_id}&feedbackId=${feedback.id}`}
            >
              Create Offer
            </Link>
          )}
          {revisions.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium">Revision History</h3>
              {revisions.map((r) => (
                <div
                  key={r.id}
                  className="mt-2 rounded-md bg-gray-50 p-3 text-sm"
                >
                  <p>
                    Revision {r.revision_number}: {r.previous_decision} →{" "}
                    {r.new_decision}
                  </p>
                  <p className="text-gray-600">{r.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 font-medium capitalize">{value}</p>
    </div>
  );
}
