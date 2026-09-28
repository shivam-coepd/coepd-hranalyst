import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function getAdminAnalytics() {
  const [appsData, placement, feedback, submission, alerts] = await Promise.all([
    supabaseAdmin.from("applications").select("status"),
    supabaseAdmin.from("analytics_placement_summary").select("*").single(),
    supabaseAdmin.from("analytics_feedback_sla").select("sla_status"),
    supabaseAdmin.from("analytics_submission_sla").select("within_24h"),
    supabaseAdmin
      .from("operational_alerts")
      .select("id", {
        count: "exact",
        head: true,
      })
      .in("status", ["open", "acknowledged"]),
  ]);

  const allApps = appsData.data ?? [];
  const funnelData = {
    total_applications: allApps.length,
    verified_or_beyond: allApps.filter((a) => !['applied', 'rejected', 'withdrawn'].includes(a.status)).length,
    submitted_to_client: allApps.filter((a) => !['applied', 'verified', 'rejected', 'withdrawn'].includes(a.status)).length,
    shortlisted: allApps.filter((a) => !['applied', 'verified', 'submitted', 'rejected', 'withdrawn'].includes(a.status)).length,
    interview_stage: allApps.filter((a) => ['interview', 'selected', 'placed'].includes(a.status)).length,
    selected: allApps.filter((a) => ['selected', 'placed'].includes(a.status)).length,
    placed: allApps.filter((a) => a.status === 'placed').length,
  };
  const feedbackRows = feedback.data ?? [];
  const submissionRows = submission.data ?? [];
  const within24 = submissionRows.filter((row) => row.within_24h).length;
  return {
    funnel: funnelData,
    placement: placement.data ?? {},
    feedback: {
      pending: feedbackRows.filter((row) => row.sla_status === "pending")
        .length,
      overdue: feedbackRows.filter((row) => row.sla_status === "overdue")
        .length,
      escalation: feedbackRows.filter((row) => row.sla_status === "escalation")
        .length,
      withinSla: feedbackRows.filter((row) => row.sla_status === "within_sla")
        .length,
    },
    submissionSlaPercent: submissionRows.length
      ? Number(((within24 / submissionRows.length) * 100).toFixed(1))
      : 0,
    openAlerts: alerts.count ?? 0,
  };
}
