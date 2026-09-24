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

  const application = Array.isArray(candidate.applications) ? candidate.applications[0] : candidate.applications;
  const sp = application?.student_profiles ? (Array.isArray(application.student_profiles) ? application.student_profiles[0] : application.student_profiles) : null;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between rounded-xl border bg-white p-6">
        <div>
          <p className="text-sm text-gray-500">{submission.submission_code}</p>

          <h1 className="mt-2 text-2xl font-bold">
            {String(snapshot.candidate_name ?? "Candidate")}
          </h1>

          <p className="mt-1 font-medium text-gray-800">
            {sp?.headline || String(snapshot.current_designation ?? "")}
          </p>
          
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
             {sp?.city ? <span>📍 {sp.city}{sp.state ? `, ${sp.state}` : ''}</span> : (snapshot.location ? <span>📍 {String(snapshot.location)}</span> : null)}
             {sp?.linkedin_url && <a href={sp.linkedin_url} target="_blank" className="text-blue-600 hover:underline">LinkedIn</a>}
             {sp?.github_url && <a href={sp.github_url} target="_blank" className="text-blue-600 hover:underline">GitHub</a>}
             {sp?.portfolio_url && <a href={sp.portfolio_url} target="_blank" className="text-blue-600 hover:underline">Portfolio</a>}
          </div>
        </div>
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
        <section className="rounded-xl border bg-white p-6 space-y-6">
          <h2 className="text-lg font-semibold">Candidate Profile</h2>

          {sp?.summary && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Summary</h3>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{sp.summary}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-gray-500">Experience</dt>
              <dd className="font-medium text-sm mt-1">
                {sp?.total_experience_months || snapshot.total_experience_months
                  ? `${sp?.total_experience_months || snapshot.total_experience_months} months`
                  : "—"}
              </dd>
            </div>
            
            <div>
              <dt className="text-xs text-gray-500">Notice Period</dt>
              <dd className="font-medium text-sm mt-1">
                {sp?.notice_period_days || snapshot.notice_period_days
                  ? `${sp?.notice_period_days || snapshot.notice_period_days} days`
                  : "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500">Current Company</dt>
              <dd className="font-medium text-sm mt-1">
                {sp?.current_company || String(snapshot.current_company ?? "—")}
              </dd>
            </div>
            
            <div>
              <dt className="text-xs text-gray-500">Current Designation</dt>
              <dd className="font-medium text-sm mt-1">
                {sp?.current_designation || String(snapshot.current_designation ?? "—")}
              </dd>
            </div>
            
            <div>
              <dt className="text-xs text-gray-500">Current CTC</dt>
              <dd className="font-medium text-sm mt-1">
                {sp?.current_ctc ? `₹${sp.current_ctc}` : "—"}
              </dd>
            </div>
            
            <div>
              <dt className="text-xs text-gray-500">Expected CTC</dt>
              <dd className="font-medium text-sm mt-1">
                {sp?.expected_ctc ? `₹${sp.expected_ctc}` : "—"}
              </dd>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Education</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-500">Highest Qualification</dt>
                <dd className="font-medium text-sm mt-1">{sp?.highest_qualification || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Graduation Year</dt>
                <dd className="font-medium text-sm mt-1">{sp?.graduation_year || "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-gray-500">Specialization</dt>
                <dd className="font-medium text-sm mt-1">{sp?.specialization || "—"}</dd>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Preferences</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-500">Preferred Role</dt>
                <dd className="font-medium text-sm mt-1">{sp?.preferred_role || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Willing to Relocate</dt>
                <dd className="font-medium text-sm mt-1">{sp?.willing_to_relocate ? "Yes" : "No"}</dd>
              </div>
            </div>
          </div>
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
