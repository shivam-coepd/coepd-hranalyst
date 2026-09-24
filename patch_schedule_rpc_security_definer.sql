
CREATE OR REPLACE FUNCTION public.schedule_client_interview(
    p_submission_candidate_id uuid,
    p_round_number integer,
    p_round_name character varying,
    p_interview_type character varying,
    p_scheduled_at timestamp with time zone,
    p_duration_minutes integer,
    p_timezone character varying,
    p_mode character varying,
    p_meeting_provider character varying DEFAULT NULL::character varying,
    p_meeting_link text DEFAULT NULL::text,
    p_location text DEFAULT NULL::text,
    p_instructions text DEFAULT NULL::text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
declare
    v_actor uuid := auth.uid();
    v_application_id uuid;
    v_job_id uuid;
    v_company_id uuid;
    v_student_user_id uuid;
    v_interview_id uuid;
    v_old_application_status varchar(40);
begin
    if v_actor is null then raise exception 'Authentication required'; end if;
    if p_round_number < 1 then raise exception 'Round number must be at least 1'; end if;
    if p_scheduled_at <= now() then raise exception 'Interview must be scheduled in the future'; end if;
    if p_duration_minutes < 15 or p_duration_minutes > 480 then raise exception 'Invalid interview duration'; end if;
    if p_mode not in ('online', 'offline') then raise exception 'Invalid interview mode'; end if;
    if p_mode = 'online' and (p_meeting_link is null or length(trim(p_meeting_link)) = 0) then raise exception 'Meeting link is required for online interview'; end if;
    if p_mode = 'offline' and (p_location is null or length(trim(p_location)) = 0) then raise exception 'Location is required for offline interview'; end if;

    select sc.application_id, s.job_id, s.company_id, a.status, sp.user_id
    into v_application_id, v_job_id, v_company_id, v_old_application_status, v_student_user_id
    from public.submission_candidates sc
    join public.submissions s on s.id = sc.submission_id
    join public.applications a on a.id = sc.application_id
    join public.student_profiles sp on sp.id = a.student_id
    where sc.id = p_submission_candidate_id and sc.status = 'shortlisted' and s.status <> 'cancelled';

    if v_application_id is null then raise exception 'Candidate must be shortlisted first'; end if;

    if not exists (
        select 1 from public.client_hr_profiles chp
        where chp.user_id = v_actor and chp.company_id = v_company_id and chp.is_active = true
    ) then raise exception 'Not authorized for this company'; end if;

    if not exists (
        select 1 from public.mock_interviews mi
        join public.mock_scorecards ms on ms.mock_interview_id = mi.id
        where mi.application_id = v_application_id and mi.status = 'completed' and ms.status = 'submitted'
    ) then raise exception 'Mock interview must be completed before client interview'; end if;

    if exists (
        select 1 from public.interviews i
        where i.application_id = v_application_id and i.round_number = p_round_number
          and i.status in ('scheduled', 'confirmed', 'rescheduled', 'in_progress')
    ) then raise exception 'An active interview already exists for this round'; end if;

    insert into public.interviews (
        application_id, submission_candidate_id, job_id, company_id, client_hr_user_id, round_number, round_name, interview_type, scheduled_at, duration_minutes, timezone, mode, meeting_provider, meeting_link, location, instructions, status, scheduled_by
    )
    values (
        v_application_id, p_submission_candidate_id, v_job_id, v_company_id, v_actor, p_round_number, trim(p_round_name), p_interview_type, p_scheduled_at, p_duration_minutes, p_timezone, p_mode, p_meeting_provider, p_meeting_link, p_location, p_instructions, 'scheduled', v_actor
    )
    returning id into v_interview_id;

    insert into public.interview_participants (interview_id, participant_type, user_id) values (v_interview_id, 'candidate', v_student_user_id);
    insert into public.interview_participants (interview_id, participant_type, user_id) values (v_interview_id, 'client_hr', v_actor);
    insert into public.interview_status_history (interview_id, old_status, new_status, changed_by) values (v_interview_id, null, 'scheduled', v_actor);

    update public.applications set status = 'interview_scheduled', updated_at = now() where id = v_application_id;

    insert into public.application_status_history (application_id, old_status, new_status, changed_by, metadata)
    values (v_application_id, v_old_application_status, 'interview_scheduled', v_actor, jsonb_build_object('interview_id', v_interview_id, 'round_number', p_round_number));

    insert into public.notification_outbox (event_type, channel, recipient_user_id, entity_type, entity_id, payload, dedupe_key)
    values ('CLIENT_INTERVIEW_SCHEDULED', 'in_app', v_student_user_id, 'interview', v_interview_id, jsonb_build_object('interview_id', v_interview_id, 'application_id', v_application_id, 'scheduled_at', p_scheduled_at, 'round_number', p_round_number, 'round_name', p_round_name, 'mode', p_mode), 'interview:' || v_interview_id::text || ':student:inapp');

    -- FIX: DISTINCT to avoid duplicate constraint errors for users who have both admin and super_admin roles
    insert into public.notification_outbox (event_type, channel, recipient_user_id, entity_type, entity_id, payload, dedupe_key)
    select DISTINCT 'CLIENT_INTERVIEW_SCHEDULED', 'in_app', ur.user_id, 'interview', v_interview_id, jsonb_build_object('interview_id', v_interview_id, 'application_id', v_application_id, 'company_id', v_company_id, 'scheduled_at', p_scheduled_at), 'interview:' || v_interview_id::text || ':admin:' || ur.user_id::text
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where r.name in ('admin', 'super_admin');

    return v_interview_id;
end;
$$;
