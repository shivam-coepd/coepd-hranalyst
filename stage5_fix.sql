
-- Drop existing confirm_placement if any
DROP FUNCTION IF EXISTS public.confirm_placement(uuid, text);

-- Recreate student_decide_offer WITHOUT placement generation
CREATE OR REPLACE FUNCTION public.student_decide_offer(p_offer_id uuid, p_decision character varying, p_reason text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    v_actor uuid;
    v_offer public.offers%rowtype;
    v_student_user_id uuid;
begin
    v_actor := auth.uid();

    if p_decision not in ('accepted', 'declined') then
        raise exception 'Invalid offer decision';
    end if;

    select * into v_offer from public.offers where id = p_offer_id for update;
    if v_offer.id is null then raise exception 'Offer not found'; end if;

    select user_id into v_student_user_id from public.student_profiles where id = v_offer.student_id;
    if v_student_user_id <> v_actor then raise exception 'You cannot decide another student offer'; end if;

    if v_offer.status not in ('uploaded', 'sent_to_student') then
        raise exception 'Offer cannot be decided in current state';
    end if;

    if p_decision = 'declined' and (p_reason is null or length(trim(p_reason)) = 0) then
        raise exception 'Reason is required when declining an offer';
    end if;

    if p_decision = 'accepted' then
        update public.offers
        set status = 'accepted', student_decided_at = now(), student_decision_reason = p_reason, updated_at = now()
        where id = p_offer_id;

        insert into public.offer_status_history (offer_id, old_status, new_status, changed_by, reason)
        values (p_offer_id, v_offer.status, 'accepted', v_actor, p_reason);

        update public.applications
        set status = 'offer_accepted', updated_at = now()
        where id = v_offer.application_id;

        insert into public.application_status_history (application_id, old_status, new_status, changed_by, metadata)
        values (v_offer.application_id, 'offer_received', 'offer_accepted', v_actor, jsonb_build_object('offer_id', v_offer.id));

        return null;
    else
        update public.offers
        set status = 'declined', student_decided_at = now(), student_decision_reason = p_reason, updated_at = now()
        where id = p_offer_id;

        update public.applications
        set status = 'selected', updated_at = now()
        where id = v_offer.application_id;

        insert into public.offer_status_history (offer_id, old_status, new_status, changed_by, reason)
        values (p_offer_id, v_offer.status, 'declined', v_actor, p_reason);

        insert into public.application_status_history (application_id, old_status, new_status, changed_by, reason)
        values (v_offer.application_id, 'offer_received', 'selected', v_actor, p_reason);

        return null;
    end if;
end;
$function$;

-- Create confirm_placement RPC
CREATE OR REPLACE FUNCTION public.confirm_placement(p_offer_id uuid, p_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    v_actor uuid;
    v_offer public.offers%rowtype;
    v_placement_id uuid;
begin
    v_actor := auth.uid();

    if not (public.is_admin() or public.has_role('placement_hr')) then
        raise exception 'Only Placement HR/Admin can confirm placements';
    end if;

    select * into v_offer from public.offers where id = p_offer_id for update;
    if v_offer.id is null then raise exception 'Offer not found'; end if;

    if v_offer.status <> 'accepted' then
        raise exception 'Offer must be accepted by student before confirming placement';
    end if;

    if exists (select 1 from public.placements where application_id = v_offer.application_id) then
        raise exception 'Placement already exists for this application';
    end if;

    insert into public.placements (
        application_id, offer_id, student_id, job_id, company_id,
        placed_designation, placed_department, joining_location,
        annual_ctc, currency, joining_date, placement_status,
        placed_by, placed_at
    ) values (
        v_offer.application_id, v_offer.id, v_offer.student_id, v_offer.job_id, v_offer.company_id,
        v_offer.designation, v_offer.department, v_offer.joining_location,
        v_offer.annual_ctc, coalesce(v_offer.currency, 'INR'), v_offer.joining_date, 'placed',
        v_actor, now()
    ) returning id into v_placement_id;

    update public.applications
    set status = 'placed', placed_at = now(), updated_at = now()
    where id = v_offer.application_id;

    insert into public.application_status_history (application_id, old_status, new_status, changed_by, metadata)
    values (v_offer.application_id, 'offer_accepted', 'placed', v_actor, jsonb_build_object('offer_id', v_offer.id, 'placement_id', v_placement_id));

    insert into public.placement_status_history (placement_id, old_status, new_status, changed_by, reason)
    values (v_placement_id, null, 'placed', v_actor, p_notes);

    -- Notify admins & placement HR without duplicates
    insert into public.notification_outbox (event_type, channel, recipient_user_id, entity_type, entity_id, payload, dedupe_key)
    select distinct
        'CANDIDATE_PLACED', 'in_app', ur.user_id, 'placement', v_placement_id,
        jsonb_build_object('placement_id', v_placement_id, 'application_id', v_offer.application_id, 'student_id', v_offer.student_id, 'company_id', v_offer.company_id),
        'placement:' || v_placement_id::text || ':admin:' || ur.user_id::text
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where r.name in ('admin', 'super_admin', 'placement_hr');

    return v_placement_id;
end;
$function$;
