begin;

create sequence if not exists public.mock_interview_code_seq start 1;

create table if not exists public.mock_availability_slots (
  id uuid primary key default gen_random_uuid(),
  evaluator_user_id uuid not null references public.profiles(id),
  created_by uuid not null references public.profiles(id),
  starts_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes between 15 and 240),
  mode varchar(20) not null check (mode in ('online','offline')),
  meeting_link text,
  location text,
  status varchar(20) not null default 'available' check (status in ('available','booked','cancelled','expired')),
  booked_application_id uuid references public.applications(id),
  booked_by uuid references public.profiles(id),
  booked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((mode='online' and meeting_link is not null) or (mode='offline' and location is not null))
);
create index if not exists mock_slots_evaluator_start_idx on public.mock_availability_slots(evaluator_user_id, starts_at);
create index if not exists mock_slots_available_idx on public.mock_availability_slots(starts_at) where status='available';
create unique index if not exists mock_slots_evaluator_exact_start_uidx on public.mock_availability_slots(evaluator_user_id, starts_at) where status <> 'cancelled';
create trigger mock_slots_set_updated_at before update on public.mock_availability_slots for each row execute function public.set_updated_at();

create table if not exists public.mock_interviews (
  id uuid primary key default gen_random_uuid(),
  mock_code varchar(40) not null unique,
  application_id uuid not null references public.applications(id),
  submission_candidate_id uuid references public.submission_candidates(id),
  availability_slot_id uuid references public.mock_availability_slots(id),
  evaluator_user_id uuid not null references public.profiles(id),
  scheduled_by uuid not null references public.profiles(id),
  booking_source varchar(30) not null check (booking_source in ('placement_hr','admin','student')),
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes between 15 and 240),
  mode varchar(20) not null check (mode in ('online','offline')),
  meeting_link text,
  location text,
  status varchar(20) not null default 'scheduled' check (status in ('scheduled','confirmed','in_progress','completed','cancelled','no_show')),
  student_confirmed_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles(id),
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((mode='online' and meeting_link is not null) or (mode='offline' and location is not null))
);
create index if not exists mock_interviews_application_idx on public.mock_interviews(application_id, scheduled_at desc);
create index if not exists mock_interviews_evaluator_idx on public.mock_interviews(evaluator_user_id, scheduled_at);
create unique index if not exists mock_interviews_one_active_application_uidx on public.mock_interviews(application_id) where status in ('scheduled','confirmed','in_progress');
create trigger mock_interviews_set_updated_at before update on public.mock_interviews for each row execute function public.set_updated_at();

create table if not exists public.mock_scorecards (
  id uuid primary key default gen_random_uuid(),
  mock_interview_id uuid not null references public.mock_interviews(id) on delete cascade,
  version integer not null default 1 check (version > 0),
  status varchar(20) not null default 'draft' check (status in ('draft','submitted','revised')),
  communication_score numeric(5,2) not null check (communication_score between 0 and 100),
  technical_score numeric(5,2) not null check (technical_score between 0 and 100),
  domain_score numeric(5,2) not null check (domain_score between 0 and 100),
  overall_score numeric(5,2) not null check (overall_score between 0 and 100),
  strengths text,
  improvement_areas text,
  evaluator_notes text,
  student_visible_notes text,
  recommendation varchar(50) not null check (recommendation in ('ready','ready_with_minor_improvement','needs_another_mock','not_ready')),
  scoring_version varchar(50) not null default 'mock-score-v1',
  created_by uuid not null references public.profiles(id),
  submitted_by uuid references public.profiles(id),
  submitted_at timestamptz,
  revised_by uuid references public.profiles(id),
  revised_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(mock_interview_id, version)
);
create unique index if not exists mock_scorecards_one_current_uidx on public.mock_scorecards(mock_interview_id) where status in ('draft','submitted');
create index if not exists mock_scorecards_mock_idx on public.mock_scorecards(mock_interview_id, version desc);
create trigger mock_scorecards_set_updated_at before update on public.mock_scorecards for each row execute function public.set_updated_at();

alter table public.submission_candidates add column if not exists current_mock_score numeric(5,2) check (current_mock_score between 0 and 100);

create or replace function public.next_mock_code() returns text language sql security definer set search_path=public as $$
  select 'MOCK-' || to_char(current_date,'YYYY') || '-' || lpad(nextval('public.mock_interview_code_seq')::text,6,'0');
$$;

create or replace function public.stage09_is_admin(p_user uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id where ur.user_id=p_user and r.name in ('super_admin','admin'));
$$;
create or replace function public.stage09_is_placement_hr(p_user uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id where ur.user_id=p_user and r.name='placement_hr');
$$;

create or replace function public.create_mock_slot(
 p_evaluator_user_id uuid, p_starts_at timestamptz, p_duration_minutes integer,
 p_mode text, p_meeting_link text default null, p_location text default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_id uuid;
begin
 if v_actor is null or not (public.stage09_is_admin(v_actor) or public.stage09_is_placement_hr(v_actor)) then raise exception 'Not authorized'; end if;
 if p_starts_at <= now() then raise exception 'Mock slot must be in the future'; end if;
 if p_duration_minutes < 15 or p_duration_minutes > 240 then raise exception 'Invalid duration'; end if;
 if p_mode not in ('online','offline') then raise exception 'Invalid mode'; end if;
 if p_mode='online' and nullif(trim(p_meeting_link),'') is null then raise exception 'Meeting link is required'; end if;
 if p_mode='offline' and nullif(trim(p_location),'') is null then raise exception 'Location is required'; end if;
 if not exists(select 1 from public.profiles p join public.user_roles ur on ur.user_id=p.id join public.roles r on r.id=ur.role_id where p.id=p_evaluator_user_id and p.account_status='approved' and r.name in ('placement_hr','admin','super_admin')) then raise exception 'Evaluator is not eligible'; end if;
 if public.stage09_is_placement_hr(v_actor) and not public.stage09_is_admin(v_actor) and p_evaluator_user_id<>v_actor then raise exception 'Placement HR can create only their own slots'; end if;
 insert into public.mock_availability_slots(evaluator_user_id,created_by,starts_at,duration_minutes,mode,meeting_link,location)
 values(p_evaluator_user_id,v_actor,p_starts_at,p_duration_minutes,p_mode,nullif(trim(p_meeting_link),''),nullif(trim(p_location),'')) returning id into v_id;
 insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,new_data) values(v_actor,'mock_availability_slot',v_id,'MOCK_SLOT_CREATED',jsonb_build_object('starts_at',p_starts_at,'evaluator_user_id',p_evaluator_user_id));
 return v_id;
end $$;

create or replace function public.schedule_mock_interview(
 p_application_id uuid, p_evaluator_user_id uuid, p_scheduled_at timestamptz, p_duration_minutes integer,
 p_mode text, p_meeting_link text default null, p_location text default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_job_hr uuid; v_student uuid; v_submission_candidate uuid; v_old text; v_id uuid; v_code text;
begin
 if v_actor is null or not (public.stage09_is_admin(v_actor) or public.stage09_is_placement_hr(v_actor)) then raise exception 'Not authorized'; end if;
 select sp.user_id,a.status,j.assigned_placement_hr into v_student,v_old,v_job_hr from public.applications a join public.student_profiles sp on sp.id=a.student_id join public.jobs j on j.id=a.job_id where a.id=p_application_id for update of a;
 if v_student is null then raise exception 'Application not found'; end if;
 if public.stage09_is_placement_hr(v_actor) and not public.stage09_is_admin(v_actor) and v_job_hr is distinct from v_actor then raise exception 'Application is not assigned to you'; end if;
 if v_old not in ('submitted_to_client','client_review','shortlisted','mock_pending','mock_scheduled','mock_completed') then raise exception 'Application is not eligible for a mock interview'; end if;
 if p_scheduled_at<=now() then raise exception 'Mock must be scheduled in the future'; end if;
 if exists(select 1 from public.mock_interviews where application_id=p_application_id and status in ('scheduled','confirmed','in_progress')) then raise exception 'An active mock interview already exists'; end if;
 if not exists(select 1 from public.profiles p join public.user_roles ur on ur.user_id=p.id join public.roles r on r.id=ur.role_id where p.id=p_evaluator_user_id and p.account_status='approved' and r.name in ('placement_hr','admin','super_admin')) then raise exception 'Evaluator is not eligible'; end if;
 select sc.id into v_submission_candidate from public.submission_candidates sc where sc.application_id=p_application_id and sc.status<>'withdrawn' order by sc.created_at desc limit 1;
 v_code:=public.next_mock_code();
 insert into public.mock_interviews(mock_code,application_id,submission_candidate_id,evaluator_user_id,scheduled_by,booking_source,scheduled_at,duration_minutes,mode,meeting_link,location)
 values(v_code,p_application_id,v_submission_candidate,p_evaluator_user_id,v_actor,case when public.stage09_is_admin(v_actor) then 'admin' else 'placement_hr' end,p_scheduled_at,p_duration_minutes,p_mode,nullif(trim(p_meeting_link),''),nullif(trim(p_location),'')) returning id into v_id;
 update public.applications set status='mock_scheduled',updated_at=now() where id=p_application_id;
 insert into public.application_status_history(application_id,old_status,new_status,changed_by,metadata) values(p_application_id,v_old,'mock_scheduled',v_actor,jsonb_build_object('mock_interview_id',v_id));
 insert into public.notification_outbox(event_type,channel,recipient_user_id,entity_type,entity_id,payload,dedupe_key)
 values('MOCK_SCHEDULED','in_app',v_student,'mock_interview',v_id,jsonb_build_object('mock_code',v_code,'scheduled_at',p_scheduled_at), 'mock:'||v_id||':scheduled:in_app:'||v_student);
 insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,new_data) values(v_actor,'mock_interview',v_id,'MOCK_SCHEDULED',jsonb_build_object('application_id',p_application_id,'scheduled_at',p_scheduled_at));
 return v_id;
end $$;

create or replace function public.book_mock_slot(p_application_id uuid,p_slot_id uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_student uuid; v_old text; v_slot public.mock_availability_slots%rowtype; v_submission_candidate uuid; v_id uuid; v_code text;
begin
 select sp.id into v_student from public.student_profiles sp where sp.user_id=v_actor and sp.verification_status='verified' and sp.profile_status='active';
 if v_actor is null or v_student is null then raise exception 'Only an active verified Student can book a mock'; end if;
 select a.status into v_old from public.applications a where a.id=p_application_id and a.student_id=v_student for update;
 if v_old is null then raise exception 'Application not found'; end if;
 if v_old not in ('submitted_to_client','client_review','shortlisted','mock_pending','mock_scheduled','mock_completed') then raise exception 'Application is not eligible for mock booking'; end if;
 select * into v_slot from public.mock_availability_slots where id=p_slot_id for update;
 if v_slot.id is null or v_slot.status<>'available' or v_slot.starts_at<=now() then raise exception 'Mock slot is no longer available'; end if;
 if exists(select 1 from public.mock_interviews where application_id=p_application_id and status in ('scheduled','confirmed','in_progress')) then raise exception 'An active mock interview already exists'; end if;
 select sc.id into v_submission_candidate from public.submission_candidates sc where sc.application_id=p_application_id and sc.status<>'withdrawn' order by sc.created_at desc limit 1;
 v_code:=public.next_mock_code();
 insert into public.mock_interviews(mock_code,application_id,submission_candidate_id,availability_slot_id,evaluator_user_id,scheduled_by,booking_source,scheduled_at,duration_minutes,mode,meeting_link,location,status,student_confirmed_at)
 values(v_code,p_application_id,v_submission_candidate,v_slot.id,v_slot.evaluator_user_id,v_actor,'student',v_slot.starts_at,v_slot.duration_minutes,v_slot.mode,v_slot.meeting_link,v_slot.location,'confirmed',now()) returning id into v_id;
 update public.mock_availability_slots set status='booked',booked_application_id=p_application_id,booked_by=v_actor,booked_at=now() where id=v_slot.id;
 update public.applications set status='mock_scheduled',updated_at=now() where id=p_application_id;
 insert into public.application_status_history(application_id,old_status,new_status,changed_by,metadata) values(p_application_id,v_old,'mock_scheduled',v_actor,jsonb_build_object('mock_interview_id',v_id,'booking_source','student'));
 insert into public.notification_outbox(event_type,channel,recipient_user_id,entity_type,entity_id,payload,dedupe_key)
 values('MOCK_BOOKED','in_app',v_slot.evaluator_user_id,'mock_interview',v_id,jsonb_build_object('mock_code',v_code,'scheduled_at',v_slot.starts_at), 'mock:'||v_id||':booked:in_app:'||v_slot.evaluator_user_id);
 insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,new_data) values(v_actor,'mock_interview',v_id,'MOCK_BOOKED',jsonb_build_object('application_id',p_application_id,'slot_id',p_slot_id));
 return v_id;
end $$;

create or replace function public.cancel_mock_interview(p_mock_id uuid,p_reason text) returns void language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_mock public.mock_interviews%rowtype; v_student_user uuid; v_job_hr uuid; v_old_app text;
begin
 select mi.* into v_mock from public.mock_interviews mi where mi.id=p_mock_id for update;
 if v_mock.id is null then raise exception 'Mock interview not found'; end if;
 select sp.user_id,a.status,j.assigned_placement_hr into v_student_user,v_old_app,v_job_hr from public.applications a join public.student_profiles sp on sp.id=a.student_id join public.jobs j on j.id=a.job_id where a.id=v_mock.application_id;
 if not (v_actor=v_student_user or public.stage09_is_admin(v_actor) or (public.stage09_is_placement_hr(v_actor) and v_job_hr=v_actor)) then raise exception 'Not authorized'; end if;
 if v_mock.status in ('completed','cancelled','no_show') then raise exception 'Mock cannot be cancelled in its current status'; end if;
 if nullif(trim(p_reason),'') is null then raise exception 'Cancellation reason is required'; end if;
 update public.mock_interviews set status='cancelled',cancelled_at=now(),cancelled_by=v_actor,cancellation_reason=trim(p_reason) where id=p_mock_id;
 if v_mock.availability_slot_id is not null and v_mock.scheduled_at>now() then update public.mock_availability_slots set status='available',booked_application_id=null,booked_by=null,booked_at=null where id=v_mock.availability_slot_id; end if;
 update public.applications set status='mock_pending',updated_at=now() where id=v_mock.application_id and status='mock_scheduled';
 insert into public.application_status_history(application_id,old_status,new_status,reason,changed_by,metadata) select v_mock.application_id,v_old_app,'mock_pending',trim(p_reason),v_actor,jsonb_build_object('mock_interview_id',p_mock_id) where v_old_app='mock_scheduled';
 insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,new_data) values(v_actor,'mock_interview',p_mock_id,'MOCK_CANCELLED',jsonb_build_object('reason',trim(p_reason)));
end $$;

create or replace function public.start_mock_interview(p_mock_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_mock public.mock_interviews%rowtype; v_job_hr uuid;
begin
 select * into v_mock from public.mock_interviews where id=p_mock_id for update;
 if v_mock.id is null then raise exception 'Mock interview not found'; end if;
 select j.assigned_placement_hr into v_job_hr from public.applications a join public.jobs j on j.id=a.job_id where a.id=v_mock.application_id;
 if not (public.stage09_is_admin(v_actor) or v_mock.evaluator_user_id=v_actor or (public.stage09_is_placement_hr(v_actor) and v_job_hr=v_actor)) then raise exception 'Not authorized'; end if;
 if v_mock.status not in ('scheduled','confirmed') then raise exception 'Mock cannot be started'; end if;
 update public.mock_interviews set status='in_progress',started_at=coalesce(started_at,now()) where id=p_mock_id;
end $$;

create or replace function public.submit_mock_scorecard(
 p_mock_id uuid,p_communication numeric,p_technical numeric,p_domain numeric,p_overall numeric,
 p_strengths text,p_improvement_areas text,p_evaluator_notes text,p_student_visible_notes text,p_recommendation text,p_scoring_version text
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid(); v_mock public.mock_interviews%rowtype; v_job_hr uuid; v_old_app text; v_student_user uuid; v_scorecard_id uuid; v_version int; v_old_card uuid;
begin
 select * into v_mock from public.mock_interviews where id=p_mock_id for update;
 if v_mock.id is null then raise exception 'Mock interview not found'; end if;
 select j.assigned_placement_hr,a.status,sp.user_id into v_job_hr,v_old_app,v_student_user from public.applications a join public.jobs j on j.id=a.job_id join public.student_profiles sp on sp.id=a.student_id where a.id=v_mock.application_id;
 if not (public.stage09_is_admin(v_actor) or v_mock.evaluator_user_id=v_actor or (public.stage09_is_placement_hr(v_actor) and v_job_hr=v_actor)) then raise exception 'Not authorized'; end if;
 if v_mock.status not in ('scheduled','confirmed','in_progress','completed') then raise exception 'Mock is not eligible for scorecard submission'; end if;
 if p_communication not between 0 and 100 or p_technical not between 0 and 100 or p_domain not between 0 and 100 or p_overall not between 0 and 100 then raise exception 'Scores must be between 0 and 100'; end if;
 if p_recommendation not in ('ready','ready_with_minor_improvement','needs_another_mock','not_ready') then raise exception 'Invalid recommendation'; end if;
 select id into v_old_card from public.mock_scorecards where mock_interview_id=p_mock_id and status='submitted' order by version desc limit 1;
 if v_old_card is not null then update public.mock_scorecards set status='revised',revised_by=v_actor,revised_at=now() where id=v_old_card; end if;
 select coalesce(max(version),0)+1 into v_version from public.mock_scorecards where mock_interview_id=p_mock_id;
 insert into public.mock_scorecards(mock_interview_id,version,status,communication_score,technical_score,domain_score,overall_score,strengths,improvement_areas,evaluator_notes,student_visible_notes,recommendation,scoring_version,created_by,submitted_by,submitted_at)
 values(p_mock_id,v_version,'submitted',p_communication,p_technical,p_domain,p_overall,nullif(trim(p_strengths),''),nullif(trim(p_improvement_areas),''),nullif(trim(p_evaluator_notes),''),nullif(trim(p_student_visible_notes),''),p_recommendation,p_scoring_version,v_actor,v_actor,now()) returning id into v_scorecard_id;
 update public.mock_interviews set status='completed',completed_at=coalesce(completed_at,now()) where id=p_mock_id;
 update public.applications set status='mock_completed',updated_at=now() where id=v_mock.application_id;
 insert into public.application_status_history(application_id,old_status,new_status,changed_by,metadata) select v_mock.application_id,v_old_app,'mock_completed',v_actor,jsonb_build_object('mock_interview_id',p_mock_id,'scorecard_id',v_scorecard_id) where v_old_app is distinct from 'mock_completed';
 update public.submission_candidates set current_mock_score=p_overall,updated_at=now() where application_id=v_mock.application_id and status<>'withdrawn';
 insert into public.notification_outbox(event_type,channel,recipient_user_id,entity_type,entity_id,payload,dedupe_key)
 values('MOCK_SCORECARD_SUBMITTED','in_app',v_student_user,'mock_interview',p_mock_id,jsonb_build_object('mock_code',v_mock.mock_code,'overall_score',p_overall,'recommendation',p_recommendation), 'mock:'||p_mock_id||':scorecard:v'||v_version||':in_app:'||v_student_user);
 insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,new_data) values(v_actor,'mock_scorecard',v_scorecard_id,'MOCK_SCORECARD_SUBMITTED',jsonb_build_object('mock_interview_id',p_mock_id,'version',v_version,'overall_score',p_overall,'recommendation',p_recommendation));
 return v_scorecard_id;
end $$;

revoke all on function public.next_mock_code() from public,anon,authenticated;
revoke all on function public.stage09_is_admin(uuid) from public,anon;
revoke all on function public.stage09_is_placement_hr(uuid) from public,anon;
revoke all on function public.create_mock_slot(uuid,timestamptz,integer,text,text,text) from public,anon;
revoke all on function public.schedule_mock_interview(uuid,uuid,timestamptz,integer,text,text,text) from public,anon;
revoke all on function public.book_mock_slot(uuid,uuid) from public,anon;
revoke all on function public.cancel_mock_interview(uuid,text) from public,anon;
revoke all on function public.start_mock_interview(uuid) from public,anon;
revoke all on function public.submit_mock_scorecard(uuid,numeric,numeric,numeric,numeric,text,text,text,text,text,text) from public,anon;
grant execute on function public.create_mock_slot(uuid,timestamptz,integer,text,text,text) to authenticated;
grant execute on function public.schedule_mock_interview(uuid,uuid,timestamptz,integer,text,text,text) to authenticated;
grant execute on function public.book_mock_slot(uuid,uuid) to authenticated;
grant execute on function public.cancel_mock_interview(uuid,text) to authenticated;
grant execute on function public.start_mock_interview(uuid) to authenticated;
grant execute on function public.submit_mock_scorecard(uuid,numeric,numeric,numeric,numeric,text,text,text,text,text,text) to authenticated;
grant execute on function public.stage09_is_admin(uuid), public.stage09_is_placement_hr(uuid) to authenticated;

alter table public.mock_availability_slots enable row level security;
alter table public.mock_interviews enable row level security;
alter table public.mock_scorecards enable row level security;

revoke all on public.mock_availability_slots,public.mock_interviews,public.mock_scorecards from anon,authenticated;
grant select on public.mock_availability_slots,public.mock_interviews,public.mock_scorecards to authenticated;

create policy mock_slots_internal_read on public.mock_availability_slots for select to authenticated using (public.is_admin() or evaluator_user_id=auth.uid() or public.stage09_is_placement_hr(auth.uid()));
create policy mock_interviews_internal_or_student_read on public.mock_interviews for select to authenticated using (
 public.is_admin() or evaluator_user_id=auth.uid() or exists(select 1 from public.applications a join public.jobs j on j.id=a.job_id where a.id=application_id and (j.assigned_placement_hr=auth.uid() or exists(select 1 from public.student_profiles sp where sp.id=a.student_id and sp.user_id=auth.uid())))
);
create policy mock_scorecards_internal_or_student_read on public.mock_scorecards for select to authenticated using (
 exists(select 1 from public.mock_interviews mi join public.applications a on a.id=mi.application_id join public.jobs j on j.id=a.job_id where mi.id=mock_interview_id and (public.is_admin() or mi.evaluator_user_id=auth.uid() or j.assigned_placement_hr=auth.uid() or exists(select 1 from public.student_profiles sp where sp.id=a.student_id and sp.user_id=auth.uid())))
);

insert into public.permissions(code,name,description) values
 ('mocks.read','Read mocks','Read mock interviews and scorecards'),
 ('mocks.schedule','Schedule mocks','Schedule mock interviews and availability'),
 ('mocks.book','Book mocks','Book a mock interview slot'),
 ('mocks.score','Score mocks','Submit mock scorecards')
on conflict(code) do update set description=excluded.description;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where (r.name in ('super_admin','admin') and p.code in ('mocks.read','mocks.schedule','mocks.book','mocks.score'))
   or (r.name='placement_hr' and p.code in ('mocks.read','mocks.schedule','mocks.score'))
   or (r.name='student' and p.code in ('mocks.read','mocks.book'))
on conflict do nothing;

insert into public.system_schema_versions(version,description) values('9.0','Stage 9 - mock interview scheduling, student booking, scorecards') on conflict(version) do update set description=excluded.description;
commit;
