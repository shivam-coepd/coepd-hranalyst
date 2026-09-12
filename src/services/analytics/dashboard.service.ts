import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function getAdminAnalytics() {
  const [funnel, placement, feedback, submission, alerts] = await Promise.all([
    supabaseAdmin.from("analytics_application_funnel").select("*").single(),
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
  const feedbackRows = feedback.data ?? [];
  const submissionRows = submission.data ?? [];
  const within24 = submissionRows.filter((row) => row.within_24h).length;
  return {
    funnel: funnel.data ?? {},
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
