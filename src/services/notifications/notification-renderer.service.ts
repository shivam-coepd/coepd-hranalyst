import "server-only";

import { emailLayout } from "@/lib/email/layout";

import { escapeHtml } from "@/lib/email/html";

type Payload = Record<string, unknown>;

export interface RenderedNotification {
  title: string;
  message: string;
  subject: string;
  html: string;
  actionUrl?: string;
}

function appUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return `${base}${path}`;
}

export function renderNotification(
  eventType: string,
  payload: Payload,
): RenderedNotification {
  switch (eventType) {
    case "USER_APPROVED": {
      const actionUrl = appUrl("/login");

      return {
        title: "Account Approved",

        message: "Your HRAnalyst Placement Wing account has been approved.",

        subject: "Your HRAnalyst account is approved",

        actionUrl,

        html: emailLayout({
          title: "Account Approved",

          body: `
              <p>
                Your HRAnalyst Placement Wing account is now active.
              </p>

              <p>
                You can sign in and continue your placement journey.
              </p>
            `,

          actionLabel: "Sign In",

          actionUrl,
        }),
      };
    }

    case "JOB_POSTED": {
      const title = String(payload.job_title ?? "New Job Posted");
      const companyName = String(payload.company_name ?? "A company");
      return {
        title: "New Job Posted",
        message: `${companyName} has posted a new job: ${title}.`,
        subject: `New Job Posted: ${title}`,
        actionUrl: appUrl("/placement-hr/jobs"),
        html: emailLayout({
          title: "New Job Posted",
          body: `
              <p>
                <strong>${escapeHtml(companyName)}</strong> has posted a new job:
                <strong>${escapeHtml(title)}</strong>.
              </p>
            `,
          actionLabel: "View Jobs",
          actionUrl: appUrl("/placement-hr/jobs"),
        }),
      };
    }

    case "JOB_APPLIED": {
      const jobTitle = String(payload.job_title ?? "a job");
      const studentName = String(payload.student_name ?? "A student");
      return {
        title: "New Application Received",
        message: `${studentName} has applied for ${jobTitle}.`,
        subject: `New Application: ${jobTitle}`,
        actionUrl: appUrl("/placement-hr/applications"),
        html: emailLayout({
          title: "New Application",
          body: `
              <p>
                <strong>${escapeHtml(studentName)}</strong> has applied for
                <strong>${escapeHtml(jobTitle)}</strong>.
              </p>
            `,
          actionLabel: "View Applications",
          actionUrl: appUrl("/placement-hr/applications"),
        }),
      };
    }

    case "JOB_PUBLISHED": {
      const title = String(payload.job_title ?? "New Job Opportunity");

      const jobId = String(payload.job_id ?? "");

      const actionUrl = appUrl(`/student/jobs/${jobId}`);

      return {
        title: "New Job Published",

        message: `${title} is now available for applications.`,

        subject: `New Job: ${title}`,

        actionUrl,

        html: emailLayout({
          title: "New Job Opportunity",

          body: `
              <p>
                <strong>${escapeHtml(title)}</strong>
                has been published on HRAnalyst Placement Wing.
              </p>
            `,

          actionLabel: "View Job",

          actionUrl,
        }),
      };
    }

    case "APPLICATION_REJECTED": {
      const actionUrl = appUrl("/student/applications");
      const jobTitle = payload.job_title ? ` for ${payload.job_title}` : "";
      const reason = payload.reason ? String(payload.reason) : "Verification criteria not met";

      return {
        title: "Application Verification Update",
        message: `Your application${jobTitle} was not approved: ${reason}`,
        subject: `Application Update${jobTitle}`,
        actionUrl,
        html: emailLayout({
          title: "Application Update",
          body: `
              <p>
                Your application${escapeHtml(jobTitle)} was reviewed by the Placement HR team and could not be verified at this stage.
              </p>
              <p>
                <strong>Reason:</strong> ${escapeHtml(reason)}
              </p>
            `,
          actionLabel: "View Applications",
          actionUrl,
        }),
      };
    }

    case "APPLICATION_UPDATE_REQUESTED": {
      const actionUrl = appUrl("/student/applications");
      const jobTitle = payload.job_title ? ` for ${payload.job_title}` : "";
      const details = payload.update_request ? String(payload.update_request) : "Please update your CV or details";

      return {
        title: "Application Updates Requested",
        message: `Action required on your application${jobTitle}: ${details}`,
        subject: `Action Required: Application Update${jobTitle}`,
        actionUrl,
        html: emailLayout({
          title: "Action Required: Update Application",
          body: `
              <p>
                The Placement HR team reviewed your application${escapeHtml(jobTitle)} and requested updates before finalizing verification.
              </p>
              <p>
                <strong>Requested Updates:</strong> ${escapeHtml(details)}
              </p>
            `,
          actionLabel: "Update Application",
          actionUrl,
        }),
      };
    }

    case "APPLICATION_VERIFIED": {
      const actionUrl = appUrl("/student/applications");

      return {
        title: "Application Verified",

        message: "Your application has been verified by the Placement Team.",

        subject: "Your application has been verified",

        actionUrl,

        html: emailLayout({
          title: "Application Verified",

          body: `
              <p>
                Your application has successfully cleared Placement HR verification.
              </p>
            `,

          actionLabel: "View Application",

          actionUrl,
        }),
      };
    }

    case "CLIENT_SUBMISSION_CREATED": {
      const submissionId = String(payload.submission_id ?? "");

      const count = Number(payload.candidate_count ?? 0);

      const actionUrl = appUrl(`/client/submissions/${submissionId}`);

      return {
        title: "New Candidate Submission",

        message: `${count} verified candidate profile${count === 1 ? "" : "s"} submitted for review.`,

        subject: "New candidate profiles submitted",

        actionUrl,

        html: emailLayout({
          title: "New Candidate Submission",

          body: `
              <p>
                ${count}
                verified candidate profile${count === 1 ? "" : "s"}
                have been submitted for your review.
              </p>
            `,

          actionLabel: "Review Candidates",

          actionUrl,
        }),
      };
    }

    case "CLIENT_CANDIDATE_SHORTLISTED": {
      const actionUrl = appUrl("/student/applications");

      return {
        title: "You Have Been Shortlisted",

        message: "The client has shortlisted your profile.",

        subject: "You have been shortlisted",

        actionUrl,

        html: emailLayout({
          title: "Candidate Shortlisted",

          body: `
              <p>
                Your profile has been shortlisted by the client.
              </p>

              <p>
                Continue monitoring your dashboard for the next interview steps.
              </p>
            `,

          actionLabel: "View Application",

          actionUrl,
        }),
      };
    }

    case "CLIENT_INTERVIEW_SCHEDULED":
    case "CLIENT_INTERVIEW_RESCHEDULED": {
      const interviewId = String(payload.interview_id ?? "");

      const scheduledAt = payload.scheduled_at
        ? new Date(String(payload.scheduled_at)).toLocaleString("en-IN", {
            timeZone: String(payload.timezone ?? "Asia/Kolkata"),
          })
        : "";

      const roundName = String(payload.round_name ?? "Client Interview");

      const actionUrl = appUrl(`/student/interviews`);

      const rescheduled = eventType === "CLIENT_INTERVIEW_RESCHEDULED";

      return {
        title: rescheduled ? "Interview Rescheduled" : "Interview Scheduled",

        message: `${roundName} is ${rescheduled ? "rescheduled" : "scheduled"} for ${scheduledAt}.`,

        subject: rescheduled
          ? "Your interview has been rescheduled"
          : "Your interview has been scheduled",

        actionUrl,

        html: emailLayout({
          title: rescheduled ? "Interview Rescheduled" : "Interview Scheduled",

          body: `
              <p>
                <strong>${escapeHtml(roundName)}</strong>
              </p>

              <p>
                Schedule:
                <strong>${escapeHtml(scheduledAt)}</strong>
              </p>

              <p>
                Interview Reference:
                ${escapeHtml(interviewId)}
              </p>
            `,

          actionLabel: "View Interview",

          actionUrl,
        }),
      };
    }

    case "INTERVIEW_FEEDBACK_SUBMITTED": {
      const decision = String(payload.decision ?? "updated");

      return {
        title: "Interview Feedback Updated",

        message: `Your interview status has been updated: ${decision}.`,

        subject: "Interview feedback update",

        actionUrl: appUrl("/student/applications"),

        html: emailLayout({
          title: "Interview Feedback",

          body: `
              <p>
                Your interview result has been updated.
              </p>

              <p>
                Decision:
                <strong>${escapeHtml(decision)}</strong>
              </p>
            `,

          actionLabel: "View Application",

          actionUrl: appUrl("/student/applications"),
        }),
      };
    }

    case "OFFER_RECEIVED": {
      const offerId = String(payload.offer_id ?? "");

      const designation = String(payload.designation ?? "Position");

      const actionUrl = appUrl(`/student/offers/${offerId}`);

      return {
        title: "Offer Received",

        message: `You have received an offer for ${designation}.`,

        subject: `Offer received: ${designation}`,

        actionUrl,

        html: emailLayout({
          title: "Congratulations — Offer Received",

          body: `
              <p>
                You have received an official offer for
                <strong>${escapeHtml(designation)}</strong>.
              </p>

              <p>
                Review the offer carefully before submitting your decision.
              </p>
            `,

          actionLabel: "Review Offer",

          actionUrl,
        }),
      };
    }

    case "CANDIDATE_PLACED": {
      return {
        title: "Candidate Placed",

        message:
          "A candidate has accepted an offer and has been marked placed.",

        subject: "Placement completed",

        actionUrl: appUrl("/placement-hr/placements"),

        html: emailLayout({
          title: "Placement Completed",

          body: `
              <p>
                A candidate has accepted the offer and a placement record has been created.
              </p>
            `,

          actionLabel: "View Placements",

          actionUrl: appUrl("/placement-hr/placements"),
        }),
      };
    }

    case "FEEDBACK_DUE": {
      return {
        title: "Interview Feedback Due",

        message: "Interview feedback is approaching the 24-hour SLA.",

        subject: "Interview feedback required",

        actionUrl: appUrl("/client/interviews"),

        html: emailLayout({
          title: "Interview Feedback Required",

          body: `
              <p>
                Feedback is still pending for a completed interview.
              </p>

              <p>
                Please submit the interview decision within the required feedback window.
              </p>
            `,

          actionLabel: "Open Interviews",

          actionUrl: appUrl("/client/interviews"),
        }),
      };
    }

    case "FEEDBACK_OVERDUE": {
      return {
        title: "Interview Feedback Overdue",

        message: "Interview feedback has exceeded the 24-hour SLA.",

        subject: "Interview feedback overdue",

        actionUrl: appUrl("/client/interviews"),

        html: emailLayout({
          title: "Feedback SLA Overdue",

          body: `
              <p>
                Feedback for a completed candidate interview has exceeded the 24-hour SLA.
              </p>
            `,

          actionLabel: "Submit Feedback",

          actionUrl: appUrl("/client/interviews"),
        }),
      };
    }

    case "FEEDBACK_ESCALATION": {
      return {
        title: "Client Feedback Escalation",

        message: "Client feedback has been pending for more than 48 hours.",

        subject: "Escalation: client feedback pending over 48 hours",

        actionUrl: appUrl("/admin/operations"),

        html: emailLayout({
          title: "Client Feedback Escalation",

          body: `
              <p>
                Client feedback has remained pending for more than 48 hours.
              </p>

              <p>
                Admin follow-up with the client is required.
              </p>
            `,

          actionLabel: "View Operations",

          actionUrl: appUrl("/admin/operations"),
        }),
      };
    }

    default: {
      return {
        title: "HRAnalyst Update",

        message: String(
          payload.message ?? "You have a new HRAnalyst Placement Wing update.",
        ),

        subject: "HRAnalyst Placement Wing update",

        actionUrl: appUrl("/"),

        html: emailLayout({
          title: "HRAnalyst Update",

          body: `
              <p>
                ${escapeHtml(payload.message ?? "You have a new update.")}
              </p>
            `,
        }),
      };
    }
  }
}
