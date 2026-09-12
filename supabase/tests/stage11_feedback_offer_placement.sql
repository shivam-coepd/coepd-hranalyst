-- Stage 11 structural/security checks. Run after migrations 1-11.
do $$
begin
  if to_regclass('public.interview_feedbacks') is null then raise exception 'Missing interview_feedbacks'; end if;
  if to_regclass('public.interview_feedback_revisions') is null then raise exception 'Missing interview_feedback_revisions'; end if;
  if to_regclass('public.offers') is null then raise exception 'Missing offers'; end if;
  if to_regclass('public.offer_status_history') is null then raise exception 'Missing offer_status_history'; end if;
  if to_regclass('public.placements') is null then raise exception 'Missing placements'; end if;
  if to_regclass('public.placement_status_history') is null then raise exception 'Missing placement_status_history'; end if;

  if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='applications' and column_name='offer_accepted_at') then
    raise exception 'Missing applications.offer_accepted_at';
  end if;

  if to_regprocedure('public.submit_interview_feedback(uuid,numeric,character varying,character varying,text,boolean)') is null then raise exception 'Missing submit_interview_feedback'; end if;
  if to_regprocedure('public.revise_interview_feedback(uuid,numeric,character varying,character varying,text,boolean,text)') is null then raise exception 'Missing revise_interview_feedback'; end if;
  if to_regprocedure('public.student_decide_offer(uuid,character varying,text)') is null then raise exception 'Missing student_decide_offer'; end if;
  if to_regprocedure('public.withdraw_offer(uuid,text)') is null then raise exception 'Missing withdraw_offer'; end if;
  if to_regprocedure('public.confirm_placement(uuid,text)') is null then raise exception 'Missing confirm_placement'; end if;
  if to_regprocedure('public.transition_placement(uuid,character varying,text,timestamp with time zone)') is null then raise exception 'Missing transition_placement'; end if;

  if not exists(select 1 from public.system_schema_versions where version='11.0') then raise exception 'Missing Stage 11 schema version'; end if;

  if has_table_privilege('authenticated','public.offers','INSERT')
     or has_table_privilege('authenticated','public.offers','UPDATE')
     or has_table_privilege('authenticated','public.offers','DELETE') then
    raise exception 'authenticated has direct offer mutation privilege';
  end if;
  if has_table_privilege('authenticated','public.placements','INSERT')
     or has_table_privilege('authenticated','public.placements','UPDATE')
     or has_table_privilege('authenticated','public.placements','DELETE') then
    raise exception 'authenticated has direct placement mutation privilege';
  end if;
end $$;

select 'STAGE 11 FEEDBACK/OFFER/PLACEMENT STRUCTURE: PASS' as result;
