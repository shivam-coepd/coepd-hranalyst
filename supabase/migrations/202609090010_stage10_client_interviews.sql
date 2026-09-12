begin;

-- HRAnalyst Placement Wing - Stage 10
-- Client shortlisting + client interview scheduling.

alter table public.applications
  add column if not exists shortlisted_at timestamptz;

create table if not exists public.client_candidate_decisions (
  id uuid primary key default gen_random_uuid(),
  submission_candidate_id uuid not null references public.submission_candidates(id),
  application_id uuid not null references public.applications(id),
  company_id uuid not null references public.companies(id),
  decision varchar(30) not null check (decision in ('shortlisted','rejected')),
  reason_code varchar(100),
  reason text,
  decision_version integer not null default 1 check (decision_version > 0),
  is_current boolean not null default true,
  decided_by uuid not null references public.profiles(id),
  decided_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (decision <> 'rejected' or nullif(trim(reason),'') is not null)
);
create unique index if not exists client_candidate_decisions_current_idx
  on public.client_candidate_decisions(submission_candidate_id) where is_current;
create unique index if not exists client_candidate_decisions_version_idx
  on public.client_candidate_decisions(submission_candidate_id,decision_version);
create index if not exists client_candidate_decisions_application_idx on public.client_candidate_decisions(application_id);
create index if not exists client_candidate_decisions_company_idx on public.client_candidate_decisions(company_id);

create table if not exists public.client_candidate_decision_history (
  id bigint generated always as identity primary key,
  submission_candidate_id uuid not null references public.submission_candidates(id),
  old_decision varchar(30),
  new_decision varchar(30) not null,
  reason_code varchar(100),
  reason text,
  changed_by uuid not null references public.profiles(id),
  changed_at timestamptz not null default now()
);
create index if not exists client_candidate_decision_history_candidate_idx
  on public.client_candidate_decision_history(submission_candidate_id,changed_at desc);

create sequence if not exists public.interview_code_seq;

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  interview_code varchar(50) not null unique default ('HRA-INT-'||to_char(now(),'YYYY')||'-'||lpad(nextval('public.interview_code_seq')::text,6,'0')),
  application_id uuid not null references public.applications(id),
  submission_candidate_id uuid not null references public.submission_candidates(id),
  job_id uuid not null references public.jobs(id),
  company_id uuid not null references public.companies(id),
  client_hr_user_id uuid not null references public.profiles(id),
  round_number integer not null check (round_number > 0),
  round_name varchar(150) not null,
  interview_type varchar(50) not null default 'client' check (interview_type in ('client','technical','managerial','hr','final','other')),
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes between 15 and 480),
  timezone varchar(100) not null default 'Asia/Kolkata',
  mode varchar(30) not null check (mode in ('online','offline')),
  meeting_provider varchar(50),
  meeting_link text,
  location text,
  instructions text,
  status varchar(40) not null default 'scheduled' check (status in ('scheduled','confirmed','rescheduled','in_progress','completed','cancelled','candidate_no_show','client_no_show')),
  scheduled_by uuid not null references public.profiles(id),
  scheduled_at_created timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles(id),
  cancellation_reason text,
  external_calendar_provider varchar(50),
  external_calendar_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  check (mode <> 'online' or nullif(trim(meeting_link),'') is not null),
  check (mode <> 'offline' or nullif(trim(location),'') is not null)
);
create index if not exists interviews_application_idx on public.interviews(application_id);
create index if not exists interviews_submission_candidate_idx on public.interviews(submission_candidate_id);
create index if not exists interviews_company_idx on public.interviews(company_id);
create index if not exists interviews_client_hr_idx on public.interviews(client_hr_user_id,scheduled_at);
create index if not exists interviews_scheduled_idx on public.interviews(scheduled_at);
create unique index if not exists interviews_active_round_idx on public.interviews(application_id,round_number)
  where status in ('scheduled','confirmed','rescheduled','in_progress') and deleted_at is null;

create table if not exists public.interview_status_history (
  id bigint generated always as identity primary key,
  interview_id uuid not null references public.interviews(id) on delete cascade,
  old_status varchar(40), new_status varchar(40) not null,
  changed_by uuid references public.profiles(id), reason text, metadata jsonb,
  changed_at timestamptz not null default now()
);
create index if not exists interview_status_history_interview_idx on public.interview_status_history(interview_id,changed_at desc);

create table if not exists public.interview_reschedules (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  old_scheduled_at timestamptz not null, new_scheduled_at timestamptz not null,
  old_timezone varchar(100), new_timezone varchar(100),
  old_mode varchar(30), new_mode varchar(30),
  old_meeting_link text, new_meeting_link text,
  old_location text, new_location text,
  reason text not null,
  rescheduled_by uuid not null references public.profiles(id),
  rescheduled_at timestamptz not null default now()
);
create index if not exists interview_reschedules_interview_idx on public.interview_reschedules(interview_id,rescheduled_at desc);

create table if not exists public.interview_participants (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  participant_type varchar(30) not null check (participant_type in ('candidate','client_hr','placement_hr','panel_member','observer')),
  user_id uuid references public.profiles(id),
  external_name varchar(255), external_email varchar(255),
  attendance_status varchar(30) not null default 'unknown' check (attendance_status in ('unknown','present','late','absent')),
  created_at timestamptz not null default now(),
  check (user_id is not null or external_email is not null)
);
create index if not exists interview_participants_interview_idx on public.interview_participants(interview_id);

-- keep Stage 4 notification_outbox canonical; never redefine it here.

drop trigger if exists interviews_set_updated_at on public.interviews;
create trigger interviews_set_updated_at before update on public.interviews for each row execute function public.set_updated_at();

alter table public.client_candidate_decisions enable row level security;
alter table public.client_candidate_decision_history enable row level security;
alter table public.interviews enable row level security;
alter table public.interview_status_history enable row level security;
alter table public.interview_reschedules enable row level security;
alter table public.interview_participants enable row level security;

revoke insert,update,delete,truncate,references,trigger on public.client_candidate_decisions, public.client_candidate_decision_history,
  public.interviews, public.interview_status_history, public.interview_reschedules, public.interview_participants from anon, authenticated;
grant select on public.client_candidate_decisions, public.client_candidate_decision_history,
  public.interviews, public.interview_status_history, public.interview_reschedules, public.interview_participants to authenticated;

-- Read policies.
drop policy if exists stage10_decisions_read on public.client_candidate_decisions;
create policy stage10_decisions_read on public.client_candidate_decisions for select to authenticated using (
  public.is_admin()
  or exists(select 1 from public.client_hr_profiles chp where chp.user_id=auth.uid() and chp.company_id=client_candidate_decisions.company_id and chp.is_active)
  or exists(select 1 from public.submission_candidates sc join public.submissions s on s.id=sc.submission_id join public.jobs j on j.id=s.job_id where sc.id=client_candidate_decisions.submission_candidate_id and j.assigned_placement_hr=auth.uid())
);
drop policy if exists stage10_decision_history_read on public.client_candidate_decision_history;
create policy stage10_decision_history_read on public.client_candidate_decision_history for select to authenticated using (
  public.is_admin() or exists(select 1 from public.submission_candidates sc join public.submissions s on s.id=sc.submission_id left join public.client_hr_profiles chp on chp.user_id=auth.uid() and chp.company_id=s.company_id and chp.is_active join public.jobs j on j.id=s.job_id where sc.id=client_candidate_decision_history.submission_candidate_id and (chp.user_id is not null or j.assigned_placement_hr=auth.uid()))
);
drop policy if exists stage10_interviews_read on public.interviews;
create policy stage10_interviews_read on public.interviews for select to authenticated using (
  public.is_admin()
  or exists(select 1 from public.client_hr_profiles chp where chp.user_id=auth.uid() and chp.company_id=interviews.company_id and chp.is_active)
  or exists(select 1 from public.jobs j where j.id=interviews.job_id and j.assigned_placement_hr=auth.uid())
  or exists(select 1 from public.applications a join public.student_profiles sp on sp.id=a.student_id where a.id=interviews.application_id and sp.user_id=auth.uid())
);
drop policy if exists stage10_interview_history_read on public.interview_status_history;
create policy stage10_interview_history_read on public.interview_status_history for select to authenticated using (exists(select 1 from public.interviews i where i.id=interview_status_history.interview_id));
drop policy if exists stage10_reschedules_read on public.interview_reschedules;
create policy stage10_reschedules_read on public.interview_reschedules for select to authenticated using (exists(select 1 from public.interviews i where i.id=interview_reschedules.interview_id));
drop policy if exists stage10_participants_read on public.interview_participants;
create policy stage10_participants_read on public.interview_participants for select to authenticated using (exists(select 1 from public.interviews i where i.id=interview_participants.interview_id));

create or replace function public.client_decide_candidate(
  p_submission_candidate_id uuid, p_decision varchar, p_reason_code varchar default null, p_reason text default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_company uuid; v_app uuid; v_old_status varchar; v_old_dec varchar; v_ver int; v_id uuid; v_student uuid;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if p_decision not in ('shortlisted','rejected') then raise exception 'Invalid decision'; end if;
  if p_decision='rejected' and nullif(trim(p_reason),'') is null then raise exception 'Rejection reason is required'; end if;
  select s.company_id,sc.application_id,a.status,sp.user_id into v_company,v_app,v_old_status,v_student
  from public.submission_candidates sc join public.submissions s on s.id=sc.submission_id join public.applications a on a.id=sc.application_id join public.student_profiles sp on sp.id=a.student_id
  where sc.id=p_submission_candidate_id and s.status<>'cancelled' for update of sc,a;
  if v_app is null then raise exception 'Submitted candidate not found'; end if;
  if not exists(select 1 from public.client_hr_profiles chp where chp.user_id=v_actor and chp.company_id=v_company and chp.is_active) then raise exception 'Not authorized for this company'; end if;
  select decision into v_old_dec from public.client_candidate_decisions where submission_candidate_id=p_submission_candidate_id and is_current limit 1;
  select coalesce(max(decision_version),0)+1 into v_ver from public.client_candidate_decisions where submission_candidate_id=p_submission_candidate_id;
  update public.client_candidate_decisions set is_current=false where submission_candidate_id=p_submission_candidate_id and is_current;
  insert into public.client_candidate_decisions(submission_candidate_id,application_id,company_id,decision,reason_code,reason,decision_version,is_current,decided_by)
    values(p_submission_candidate_id,v_app,v_company,p_decision,nullif(trim(p_reason_code),''),nullif(trim(p_reason),''),v_ver,true,v_actor) returning id into v_id;
  insert into public.client_candidate_decision_history(submission_candidate_id,old_decision,new_decision,reason_code,reason,changed_by)
    values(p_submission_candidate_id,v_old_dec,p_decision,nullif(trim(p_reason_code),''),nullif(trim(p_reason),''),v_actor);
  if p_decision='shortlisted' then
    update public.submission_candidates set status='shortlisted',client_decision_at=now(),updated_at=now() where id=p_submission_candidate_id;
    update public.applications set status='shortlisted',shortlisted_at=now(),rejection_reason=null,updated_at=now() where id=v_app;
  else
    update public.submission_candidates set status='rejected',client_decision_at=now(),updated_at=now() where id=p_submission_candidate_id;
    update public.applications set status='rejected_client',rejection_reason=trim(p_reason),updated_at=now() where id=v_app;
  end if;
  insert into public.application_status_history(application_id,old_status,new_status,changed_by,reason,metadata)
    values(v_app,v_old_status,case when p_decision='shortlisted' then 'shortlisted' else 'rejected_client' end,v_actor,nullif(trim(p_reason),''),jsonb_build_object('client_decision_id',v_id));
  insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,old_data,new_data)
    values(v_actor,'submission_candidate',p_submission_candidate_id,'CLIENT_CANDIDATE_DECISION',jsonb_build_object('decision',v_old_dec),jsonb_build_object('decision',p_decision,'reason',p_reason));
  insert into public.notification_outbox(event_type,channel,recipient_user_id,entity_type,entity_id,payload,dedupe_key)
    values(case when p_decision='shortlisted' then 'CLIENT_CANDIDATE_SHORTLISTED' else 'CLIENT_CANDIDATE_REJECTED' end,'in_app',v_student,'application',v_app,jsonb_build_object('decision',p_decision,'reason',p_reason),'client-decision:'||v_id||':student:inapp');
  if p_decision='shortlisted' then
    insert into public.notification_outbox(event_type,channel,recipient_user_id,entity_type,entity_id,payload,dedupe_key)
      select 'CLIENT_CANDIDATE_SHORTLISTED','in_app',ur.user_id,'application',v_app,jsonb_build_object('submission_candidate_id',p_submission_candidate_id),'client-decision:'||v_id||':admin:'||ur.user_id
      from public.user_roles ur join public.roles r on r.id=ur.role_id where r.name in ('admin','super_admin') on conflict(dedupe_key) where dedupe_key is not null do nothing;
  end if;
  return v_id;
end $$;

create or replace function public.schedule_client_interview(
  p_submission_candidate_id uuid,
  p_round_name varchar,
  p_interview_type varchar,
  p_scheduled_at timestamptz,
  p_duration_minutes integer,
  p_timezone varchar,
  p_mode varchar,
  p_meeting_provider varchar,
  p_meeting_link text,
  p_location text,
  p_instructions text
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_app uuid; v_job uuid; v_company uuid; v_student uuid; v_old varchar; v_id uuid; v_round int; v_end timestamptz;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if p_scheduled_at<=now() then raise exception 'Interview must be scheduled in the future'; end if;
  if p_duration_minutes not between 15 and 480 then raise exception 'Invalid interview duration'; end if;
  if p_mode not in ('online','offline') then raise exception 'Invalid interview mode'; end if;
  if p_mode='online' and nullif(trim(p_meeting_link),'') is null then raise exception 'Meeting link is required for online interview'; end if;
  if p_mode='offline' and nullif(trim(p_location),'') is null then raise exception 'Location is required for offline interview'; end if;
  select sc.application_id,s.job_id,s.company_id,a.status,sp.user_id into v_app,v_job,v_company,v_old,v_student
  from public.submission_candidates sc join public.submissions s on s.id=sc.submission_id join public.applications a on a.id=sc.application_id join public.student_profiles sp on sp.id=a.student_id
  where sc.id=p_submission_candidate_id and sc.status in ('shortlisted','interview_scheduled') and s.status<>'cancelled' for update of sc,a;
  if v_app is null then raise exception 'Candidate must be shortlisted first'; end if;
  if not exists(select 1 from public.client_hr_profiles chp where chp.user_id=v_actor and chp.company_id=v_company and chp.is_active) then raise exception 'Not authorized for this company'; end if;
  if not exists(select 1 from public.mock_interviews mi join public.mock_scorecards ms on ms.mock_interview_id=mi.id where mi.application_id=v_app and mi.status='completed' and ms.status='submitted') then raise exception 'Mock interview must be completed before client interview'; end if;
  perform pg_advisory_xact_lock(hashtext(v_app::text));
  select coalesce(max(round_number),0)+1 into v_round from public.interviews where application_id=v_app and deleted_at is null;
  v_end:=p_scheduled_at + make_interval(mins=>p_duration_minutes);
  if exists(select 1 from public.interviews i where i.deleted_at is null and i.status in ('scheduled','confirmed','rescheduled','in_progress') and (i.application_id=v_app or i.client_hr_user_id=v_actor) and i.scheduled_at < v_end and (i.scheduled_at + make_interval(mins=>i.duration_minutes)) > p_scheduled_at) then raise exception 'Interview time overlaps an existing active interview'; end if;
  insert into public.interviews(application_id,submission_candidate_id,job_id,company_id,client_hr_user_id,round_number,round_name,interview_type,scheduled_at,duration_minutes,timezone,mode,meeting_provider,meeting_link,location,instructions,status,scheduled_by)
    values(v_app,p_submission_candidate_id,v_job,v_company,v_actor,v_round,coalesce(nullif(trim(p_round_name),''),'Round '||v_round),p_interview_type,p_scheduled_at,p_duration_minutes,p_timezone,p_mode,nullif(trim(p_meeting_provider),''),nullif(trim(p_meeting_link),''),nullif(trim(p_location),''),nullif(trim(p_instructions),''),'scheduled',v_actor) returning id into v_id;
  insert into public.interview_participants(interview_id,participant_type,user_id) values(v_id,'candidate',v_student),(v_id,'client_hr',v_actor);
  update public.submission_candidates set status='interview_scheduled',updated_at=now() where id=p_submission_candidate_id;
  update public.applications set status='interview_scheduled',updated_at=now() where id=v_app;
  insert into public.interview_status_history(interview_id,old_status,new_status,changed_by) values(v_id,null,'scheduled',v_actor);
  insert into public.application_status_history(application_id,old_status,new_status,changed_by,metadata) values(v_app,v_old,'interview_scheduled',v_actor,jsonb_build_object('interview_id',v_id,'round_number',v_round));
  insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,new_data) values(v_actor,'interview',v_id,'CLIENT_INTERVIEW_SCHEDULED',jsonb_build_object('application_id',v_app,'round_number',v_round,'scheduled_at',p_scheduled_at));
  insert into public.notification_outbox(event_type,channel,recipient_user_id,entity_type,entity_id,payload,dedupe_key) values
    ('CLIENT_INTERVIEW_SCHEDULED','in_app',v_student,'interview',v_id,jsonb_build_object('scheduled_at',p_scheduled_at,'round_number',v_round,'round_name',coalesce(nullif(trim(p_round_name),''),'Round '||v_round),'mode',p_mode),'interview:'||v_id||':student:inapp'),
    ('CLIENT_INTERVIEW_SCHEDULED','calendar',v_student,'interview',v_id,jsonb_build_object('scheduled_at',p_scheduled_at,'duration_minutes',p_duration_minutes,'timezone',p_timezone,'meeting_link',p_meeting_link,'location',p_location),'interview:'||v_id||':student:calendar');
  insert into public.notification_outbox(event_type,channel,recipient_user_id,entity_type,entity_id,payload,dedupe_key)
    select 'CLIENT_INTERVIEW_SCHEDULED','in_app',ur.user_id,'interview',v_id,jsonb_build_object('application_id',v_app,'company_id',v_company,'scheduled_at',p_scheduled_at),'interview:'||v_id||':admin:'||ur.user_id
    from public.user_roles ur join public.roles r on r.id=ur.role_id where r.name in ('admin','super_admin') on conflict(dedupe_key) where dedupe_key is not null do nothing;
  return v_id;
end $$;

create or replace function public.reschedule_client_interview(
  p_interview_id uuid,p_new_scheduled_at timestamptz,p_new_timezone varchar,p_new_mode varchar,p_new_meeting_provider varchar,p_new_meeting_link text,p_new_location text,p_reason text
) returns void language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_i public.interviews%rowtype; v_new_status varchar(40); v_end timestamptz; v_student uuid;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if p_new_scheduled_at<=now() then raise exception 'Interview must be scheduled in the future'; end if;
  if nullif(trim(p_reason),'') is null then raise exception 'Reschedule reason is required'; end if;
  select * into v_i from public.interviews where id=p_interview_id and deleted_at is null for update;
  if v_i.id is null then raise exception 'Interview not found'; end if;
  if v_i.status not in ('scheduled','confirmed','rescheduled') then raise exception 'Interview cannot be rescheduled'; end if;
  if not public.is_admin() and not exists(select 1 from public.client_hr_profiles chp where chp.user_id=v_actor and chp.company_id=v_i.company_id and chp.is_active) then raise exception 'Not authorized'; end if;
  if p_new_mode='online' and nullif(trim(p_new_meeting_link),'') is null then raise exception 'Meeting link is required'; end if;
  if p_new_mode='offline' and nullif(trim(p_new_location),'') is null then raise exception 'Location is required'; end if;
  v_end:=p_new_scheduled_at + make_interval(mins=>v_i.duration_minutes);
  if exists(select 1 from public.interviews x where x.id<>p_interview_id and x.deleted_at is null and x.status in ('scheduled','confirmed','rescheduled','in_progress') and (x.application_id=v_i.application_id or x.client_hr_user_id=v_i.client_hr_user_id) and x.scheduled_at<v_end and (x.scheduled_at+make_interval(mins=>x.duration_minutes))>p_new_scheduled_at) then raise exception 'Interview time overlaps an existing active interview'; end if;
  insert into public.interview_reschedules(interview_id,old_scheduled_at,new_scheduled_at,old_timezone,new_timezone,old_mode,new_mode,old_meeting_link,new_meeting_link,old_location,new_location,reason,rescheduled_by)
    values(p_interview_id,v_i.scheduled_at,p_new_scheduled_at,v_i.timezone,p_new_timezone,v_i.mode,p_new_mode,v_i.meeting_link,p_new_meeting_link,v_i.location,p_new_location,trim(p_reason),v_actor);
  v_new_status:=case when v_i.status='confirmed' then 'confirmed' else 'scheduled' end;
  update public.interviews set scheduled_at=p_new_scheduled_at,timezone=p_new_timezone,mode=p_new_mode,meeting_provider=nullif(trim(p_new_meeting_provider),''),meeting_link=nullif(trim(p_new_meeting_link),''),location=nullif(trim(p_new_location),''),status=v_new_status where id=p_interview_id;
  insert into public.interview_status_history(interview_id,old_status,new_status,changed_by,reason,metadata) values(p_interview_id,v_i.status,v_new_status,v_actor,trim(p_reason),jsonb_build_object('rescheduled',true,'old_scheduled_at',v_i.scheduled_at,'new_scheduled_at',p_new_scheduled_at));
  select sp.user_id into v_student from public.applications a join public.student_profiles sp on sp.id=a.student_id where a.id=v_i.application_id;
  insert into public.notification_outbox(event_type,channel,recipient_user_id,entity_type,entity_id,payload,dedupe_key) values('CLIENT_INTERVIEW_RESCHEDULED','in_app',v_student,'interview',p_interview_id,jsonb_build_object('scheduled_at',p_new_scheduled_at,'reason',p_reason),'interview:'||p_interview_id||':reschedule:'||extract(epoch from now())::bigint||':student');
end $$;

create or replace function public.cancel_client_interview(p_interview_id uuid,p_reason text)
returns void language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_i public.interviews%rowtype; v_student uuid; v_old_app varchar;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if nullif(trim(p_reason),'') is null then raise exception 'Cancellation reason is required'; end if;
  select * into v_i from public.interviews where id=p_interview_id and deleted_at is null for update;
  if v_i.id is null then raise exception 'Interview not found'; end if;
  if v_i.status in ('completed','cancelled') then raise exception 'Interview cannot be cancelled'; end if;
  if not public.is_admin() and not exists(select 1 from public.client_hr_profiles chp where chp.user_id=v_actor and chp.company_id=v_i.company_id and chp.is_active) then raise exception 'Not authorized'; end if;
  select status into v_old_app from public.applications where id=v_i.application_id for update;
  update public.interviews set status='cancelled',cancelled_at=now(),cancelled_by=v_actor,cancellation_reason=trim(p_reason) where id=p_interview_id;
  insert into public.interview_status_history(interview_id,old_status,new_status,changed_by,reason) values(p_interview_id,v_i.status,'cancelled',v_actor,trim(p_reason));
  if not exists(select 1 from public.interviews where application_id=v_i.application_id and id<>p_interview_id and deleted_at is null and status in ('scheduled','confirmed','rescheduled','in_progress')) then
    update public.applications set status='shortlisted',updated_at=now() where id=v_i.application_id;
    update public.submission_candidates set status='shortlisted',updated_at=now() where id=v_i.submission_candidate_id;
    insert into public.application_status_history(application_id,old_status,new_status,changed_by,reason,metadata) values(v_i.application_id,v_old_app,'shortlisted',v_actor,trim(p_reason),jsonb_build_object('interview_id',p_interview_id,'cancelled',true));
  end if;
  select sp.user_id into v_student from public.applications a join public.student_profiles sp on sp.id=a.student_id where a.id=v_i.application_id;
  insert into public.notification_outbox(event_type,channel,recipient_user_id,entity_type,entity_id,payload,dedupe_key) values('CLIENT_INTERVIEW_CANCELLED','in_app',v_student,'interview',p_interview_id,jsonb_build_object('reason',p_reason),'interview:'||p_interview_id||':cancelled:student');
end $$;

create or replace function public.complete_client_interview(p_interview_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_i public.interviews%rowtype; v_old_app varchar;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  select * into v_i from public.interviews where id=p_interview_id and deleted_at is null for update;
  if v_i.id is null then raise exception 'Interview not found'; end if;
  if not public.is_admin() and not exists(select 1 from public.client_hr_profiles chp where chp.user_id=v_actor and chp.company_id=v_i.company_id and chp.is_active) and not exists(select 1 from public.jobs j where j.id=v_i.job_id and j.assigned_placement_hr=v_actor) then raise exception 'Not authorized'; end if;
  if v_i.status not in ('scheduled','confirmed','rescheduled','in_progress') then raise exception 'Interview cannot be completed'; end if;
  select status into v_old_app from public.applications where id=v_i.application_id for update;
  update public.interviews set status='completed',completed_at=now() where id=p_interview_id;
  update public.applications set status='interview_completed',updated_at=now() where id=v_i.application_id;
  insert into public.interview_status_history(interview_id,old_status,new_status,changed_by) values(p_interview_id,v_i.status,'completed',v_actor);
  insert into public.application_status_history(application_id,old_status,new_status,changed_by,metadata) values(v_i.application_id,v_old_app,'interview_completed',v_actor,jsonb_build_object('interview_id',p_interview_id,'round_number',v_i.round_number));
end $$;

-- RPC execution is authenticated; each function re-authorizes ownership internally.
revoke all on function public.client_decide_candidate(uuid,varchar,varchar,text) from public,anon;
grant execute on function public.client_decide_candidate(uuid,varchar,varchar,text) to authenticated;
revoke all on function public.schedule_client_interview(uuid,varchar,varchar,timestamptz,integer,varchar,varchar,varchar,text,text,text) from public,anon;
grant execute on function public.schedule_client_interview(uuid,varchar,varchar,timestamptz,integer,varchar,varchar,varchar,text,text,text) to authenticated;
revoke all on function public.reschedule_client_interview(uuid,timestamptz,varchar,varchar,varchar,text,text,text) from public,anon;
grant execute on function public.reschedule_client_interview(uuid,timestamptz,varchar,varchar,varchar,text,text,text) to authenticated;
revoke all on function public.cancel_client_interview(uuid,text) from public,anon;
grant execute on function public.cancel_client_interview(uuid,text) to authenticated;
revoke all on function public.complete_client_interview(uuid) from public,anon;
grant execute on function public.complete_client_interview(uuid) to authenticated;

insert into public.permissions(code,name,description) values
 ('candidates.decide','Decide submitted candidates','Shortlist or reject submitted candidates'),
 ('interviews.read','Read client interviews','View client interview schedules'),
 ('interviews.schedule','Schedule client interviews','Schedule and reschedule client interview rounds'),
 ('interviews.manage','Manage client interviews','Cancel or complete client interviews')
on conflict(code) do update set name=excluded.name,description=excluded.description;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where (r.name in ('super_admin','admin') and p.code in ('candidates.decide','interviews.read','interviews.schedule','interviews.manage'))
   or (r.name='client_hr' and p.code in ('candidates.decide','interviews.read','interviews.schedule','interviews.manage'))
   or (r.name='placement_hr' and p.code in ('interviews.read','interviews.manage'))
   or (r.name='student' and p.code='interviews.read')
on conflict do nothing;

insert into public.system_schema_versions(version,description)
values('10.0','Client shortlisting and client interview scheduling')
on conflict(version) do update set description=excluded.description,applied_at=now();

commit;
