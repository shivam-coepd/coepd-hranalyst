import { notFound } from "next/navigation";

import { getClientCandidate } from "@/repositories/client-candidates.repository";

import { requireActiveClientHr } from "@/services/client/client-profile.service";

import { getInterviewEligibility } from "@/services/interviews/interview-eligibility.service";

import { ClientDecisionActions } from "@/components/client/client-decision-actions";

import { InterviewScheduleForm } from "@/components/interviews/interview-schedule-form";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClientCandidatePage({ params }: Props) {
  const { id } = await params;

  const { clientProfile } = await requireActiveClientHr();

  const candidate = await getClientCandidate(id);

  if (!candidate) {
    notFound();
  }

  const submission = Array.isArray(candidate.submissions)
    ? candidate.submissions[0]
    : candidate.submissions;

  if (!submission || submission.company_id !== clientProfile.company_id) {
    notFound();
  }

  const snapshot = candidate.candidate_snapshot as Record<string, unknown>;

  const decisions = Array.isArray(candidate.client_candidate_decisions)
    ? candidate.client_candidate_decisions
    : [];

  const currentDecision = decisions.find((item) => item.is_current);

  const eligibility = await getInterviewEligibility(candidate.application_id);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="rounded-xl border bg-white p-6">
        <p className="text-sm text-gray-500">{submission.submission_code}</p>

        <h1 className="mt-2 text-2xl font-bold">
          {String(snapshot.candidate_name ?? "Candidate")}
        </h1>

        <p className="mt-1 text-gray-600">
          {String(snapshot.current_designation ?? "")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Match Score</p>
          <p className="mt-2 text-3xl font-semibold">
            {candidate.submitted_match_score}%
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">ATS Score</p>
          <p className="mt-2 text-3xl font-semibold">
            {candidate.submitted_ats_score ?? "—"}
            {candidate.submitted_ats_score !== null ? "%" : ""}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Mock Score</p>
          <p className="mt-2 text-3xl font-semibold">
            {candidate.current_mock_score ?? "Not completed"}
            {candidate.current_mock_score !== null ? "%" : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Candidate Profile</h2>

          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-gray-500">Experience</dt>
              <dd className="font-medium">
                {String(snapshot.total_experience_months ?? "—")}
                {snapshot.total_experience_months ? " months" : ""}
              </dd>
            </div>

            <div>
              <dt className="text-gray-500">Current Company</dt>
              <dd className="font-medium">
                {String(snapshot.current_company ?? "—")}
              </dd>
            </div>

            <div>
              <dt className="text-gray-500">Location</dt>
              <dd className="font-medium">
                {String(snapshot.location ?? "—")}
              </dd>
            </div>

            <div>
              <dt className="text-gray-500">Notice Period</dt>
              <dd className="font-medium">
                {String(snapshot.notice_period_days ?? "—")}
                {snapshot.notice_period_days ? " days" : ""}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Client Decision</h2>

          <div className="mt-5">
            <ClientDecisionActions
              submissionCandidateId={candidate.id}
              currentStatus={currentDecision?.decision ?? candidate.status}
            />
          </div>

          {currentDecision?.reason && (
            <div className="mt-5 rounded-md bg-gray-50 p-4 text-sm">
              <strong>Reason:</strong> {currentDecision.reason}
            </div>
          )}
        </section>
      </div>

      {(currentDecision?.decision === "shortlisted" ||
        candidate.status === "shortlisted") && (
        <InterviewScheduleForm
          submissionCandidateId={candidate.id}
          disabled={!eligibility.eligible}
          disabledReason={eligibility.reason}
        />
      )}
    </div>
  );
}
