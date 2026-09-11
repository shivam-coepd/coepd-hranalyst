select
    'pending_notifications'
        as metric,

    count(*)::text
        as value

from public.notification_outbox

where status =
      'pending'


union all


select
    'failed_notifications',

    count(*)::text

from public.notification_outbox

where status =
      'failed'


union all


select
    'verification_pending',

    count(*)::text

from public.applications

where status =
      'verification_pending'


union all


select
    'scoring_failed',

    count(*)::text

from public.applications

where status =
      'scoring_failed'


union all


select
    'feedback_overdue',

    count(*)::text

from public.analytics_feedback_sla

where sla_status =
      'overdue'


union all


select
    'feedback_escalations',

    count(*)::text

from public.analytics_feedback_sla

where sla_status =
      'escalation';