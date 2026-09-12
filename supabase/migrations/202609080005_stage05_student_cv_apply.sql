begin;

-- ============================================================
-- STAGE 5: STUDENT PROFILE + CV + APPLICATION
-- ============================================================

alter table public.student_profiles
  add column if not exists skills jsonb not null default '[]'::jsonb,
  add column if not exists preferred_workplace_type varchar(30),
  add column if not exists availability_status varchar(30) not null default 'available';

do $$ begin
  alter table public.student_profiles add constraint student_profiles_preferred_workplace_type_check
  check (preferred_workplace_type is null or preferred_workplace_type in ('onsite','remote','hybrid'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.student_profiles add constraint student_profiles_availability_status_check
  check (availability_status in ('available','interviewing','not_available'));
exception when duplicate_object then null; end $$;

create table if not exists public.student_cvs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  storage_path text not null unique,
  original_file_name varchar(500) not null,
  mime_type varchar(150) not null,
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  file_extension varchar(10) not null check (file_extension in ('pdf','docx')),
  is_primary boolean not null default false,
  parsing_status varchar(30) not null default 'pending'
    check (parsing_status in ('pending','processing','completed','failed')),
  parse_error text,
  uploaded_by uuid not null references public.profiles(id),
  uploaded_at timestamptz not null default now(),
  parsed_at timestamptz,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists student_cvs_one_primary_uidx
  on public.student_cvs(student_id)
  where is_primary = true and deleted_at is null;
create index if not exists student_cvs_student_idx
  on public.student_cvs(student_id, uploaded_at desc)
  where deleted_at is null;

drop trigger if exists student_cvs_set_updated_at on public.student_cvs;
create trigger student_cvs_set_updated_at
before update on public.student_cvs
for each row execute function public.set_updated_at();

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id),
  student_id uuid not null references public.student_profiles(id),
  cv_id uuid not null references public.student_cvs(id),
  checklist_id uuid not null references public.job_checklists(id),
  status varchar(40) not null default 'scoring_pending',
  score_status varchar(30) not null default 'pending'
    check (score_status in ('pending','processing','completed','failed')),
  match_score numeric(5,2),
  ats_score numeric(5,2),
  scoring_error text,
  applied_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_job_student_unique unique(job_id, student_id),
  constraint applications_match_score_check check (match_score is null or (match_score >= 0 and match_score <= 100)),
  constraint applications_ats_score_check check (ats_score is null or (ats_score >= 0 and ats_score <= 100)),
  constraint applications_status_check check (status in (
    'applied','scoring_pending','scoring','scoring_failed','verification_pending','under_verification',
    'verified','rejected_internal','update_requested','submitted_to_client','client_review','shortlisted',
    'rejected_client','mock_pending','mock_scheduled','mock_completed','interview_scheduled','interview_completed',
    'selected','on_hold','rejected_interview','offer_pending','offer_received','offer_accepted','placed','withdrawn'
  ))
);

create index if not exists applications_student_idx on public.applications(student_id, applied_at desc);
create index if not exists applications_job_idx on public.applications(job_id, applied_at desc);
create index if not exists applications_status_idx on public.applications(status, applied_at desc);

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

create table if not exists public.application_status_history (
  id bigint generated always as identity primary key,
  application_id uuid not null references public.applications(id) on delete cascade,
  old_status varchar(40),
  new_status varchar(40) not null,
  reason text,
  changed_by uuid references public.profiles(id),
  metadata jsonb not null default '{}'::jsonb,
  changed_at timestamptz not null default now()
);
create index if not exists application_status_history_application_idx
  on public.application_status_history(application_id, changed_at desc);

-- Atomically create an application after rechecking all quality gates.
create or replace function public.create_student_application(
  p_job_id uuid,
  p_student_id uuid,
  p_cv_id uuid,
  p_actor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_status text;
  v_verification_status text;
  v_profile_user_id uuid;
  v_job public.jobs%rowtype;
  v_checklist_id uuid;
  v_application_id uuid;
begin
  if coalesce(auth.role(),'') <> 'service_role' and auth.uid() is distinct from p_actor_id then
    raise exception 'Not authorized';
  end if;

  select sp.user_id, sp.verification_status, p.account_status
    into v_profile_user_id, v_verification_status, v_profile_status
  from public.student_profiles sp
  join public.profiles p on p.id = sp.user_id
  where sp.id = p_student_id;

  if v_profile_user_id is null or v_profile_user_id <> p_actor_id then
    raise exception 'Student profile does not belong to current user';
  end if;
  if v_profile_status <> 'approved' then raise exception 'Your account is not approved'; end if;
  if v_verification_status <> 'verified' then raise exception 'Only existing HRAnalyst students can apply'; end if;

  select * into v_job from public.jobs where id=p_job_id and deleted_at is null for share;
  if v_job.id is null or v_job.status <> 'published' then raise exception 'Job is not available'; end if;
  if v_job.application_deadline is not null and v_job.application_deadline < now() then raise exception 'Application deadline has passed'; end if;

  if not exists (
    select 1 from public.student_cvs
    where id=p_cv_id and student_id=p_student_id and deleted_at is null
  ) then raise exception 'CV is not available'; end if;

  select id into v_checklist_id from public.job_checklists
  where job_id=p_job_id and status='approved'
  order by version desc limit 1;
  if v_checklist_id is null then raise exception 'Approved checklist is unavailable'; end if;

  insert into public.applications(job_id,student_id,cv_id,checklist_id,status,score_status)
  values(p_job_id,p_student_id,p_cv_id,v_checklist_id,'scoring_pending','pending')
  returning id into v_application_id;

  insert into public.application_status_history(application_id,old_status,new_status,changed_by,metadata)
  values(v_application_id,null,'scoring_pending',p_actor_id,jsonb_build_object('cv_id',p_cv_id,'checklist_id',v_checklist_id));

  insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,new_data)
  values(p_actor_id,'application',v_application_id,'APPLICATION_CREATED',jsonb_build_object('job_id',p_job_id,'cv_id',p_cv_id,'checklist_id',v_checklist_id));

  if v_job.assigned_placement_hr is not null then
    insert into public.notification_outbox(event_type,channel,recipient_user_id,entity_type,entity_id,payload,dedupe_key)
    values(
      'APPLICATION_CREATED','in_app',v_job.assigned_placement_hr,'application',v_application_id,
      jsonb_build_object('application_id',v_application_id,'job_id',p_job_id),
      'application:'||v_application_id::text||':created:in_app:'||v_job.assigned_placement_hr::text
    ) on conflict do nothing;

    insert into public.notification_outbox(event_type,channel,recipient_user_id,recipient_email,entity_type,entity_id,payload,dedupe_key)
    select 'APPLICATION_CREATED','email',v_job.assigned_placement_hr,p.email,'application',v_application_id,
      jsonb_build_object('application_id',v_application_id,'job_id',p_job_id),
      'application:'||v_application_id::text||':created:email:'||v_job.assigned_placement_hr::text
    from public.profiles p where p.id=v_job.assigned_placement_hr and p.email is not null
    on conflict do nothing;
  end if;

  return v_application_id;
exception
  when unique_violation then
    raise exception 'You have already applied for this job';
end;
$$;

create or replace function public.set_primary_student_cv(p_cv_id uuid, p_actor_id uuid)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_student_id uuid; v_user_id uuid;
begin
  if coalesce(auth.role(),'') <> 'service_role' and auth.uid() is distinct from p_actor_id then raise exception 'Not authorized'; end if;
  select sc.student_id, sp.user_id into v_student_id, v_user_id
  from public.student_cvs sc join public.student_profiles sp on sp.id=sc.student_id
  where sc.id=p_cv_id and sc.deleted_at is null for update;
  if v_student_id is null then raise exception 'CV not found'; end if;
  if v_user_id <> p_actor_id and not exists(select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id where ur.user_id=p_actor_id and r.name in ('super_admin','admin')) then raise exception 'Not authorized'; end if;
  update public.student_cvs set is_primary=false where student_id=v_student_id and deleted_at is null and is_primary=true;
  update public.student_cvs set is_primary=true where id=p_cv_id;
  insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,new_data)
  values(p_actor_id,'student_cv',p_cv_id,'CV_SET_PRIMARY',jsonb_build_object('student_id',v_student_id));
  return p_cv_id;
end;
$$;

create or replace function public.soft_delete_student_cv(p_cv_id uuid, p_actor_id uuid)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_student_id uuid; v_user_id uuid; v_was_primary boolean;
begin
  if coalesce(auth.role(),'') <> 'service_role' and auth.uid() is distinct from p_actor_id then raise exception 'Not authorized'; end if;
  select sc.student_id, sp.user_id, sc.is_primary into v_student_id, v_user_id, v_was_primary
  from public.student_cvs sc join public.student_profiles sp on sp.id=sc.student_id
  where sc.id=p_cv_id and sc.deleted_at is null for update;
  if v_student_id is null then raise exception 'CV not found'; end if;
  if v_user_id <> p_actor_id and not exists(select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id where ur.user_id=p_actor_id and r.name in ('super_admin','admin')) then raise exception 'Not authorized'; end if;
  if exists(select 1 from public.applications where cv_id=p_cv_id) then
    raise exception 'CV is linked to an application and cannot be deleted';
  end if;
  update public.student_cvs set deleted_at=now(),deleted_by=p_actor_id,is_primary=false where id=p_cv_id;
  if v_was_primary then
    update public.student_cvs set is_primary=true
    where id=(select id from public.student_cvs where student_id=v_student_id and deleted_at is null order by uploaded_at desc limit 1);
  end if;
  insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,new_data)
  values(p_actor_id,'student_cv',p_cv_id,'CV_DELETED',jsonb_build_object('student_id',v_student_id));
  return p_cv_id;
end;
$$;

alter table public.student_cvs enable row level security;
alter table public.applications enable row level security;
alter table public.application_status_history enable row level security;

drop policy if exists student_cvs_own_read on public.student_cvs;
create policy student_cvs_own_read on public.student_cvs for select to authenticated
using (exists(select 1 from public.student_profiles sp where sp.id=student_cvs.student_id and sp.user_id=auth.uid()));

drop policy if exists student_cvs_internal_read on public.student_cvs;
create policy student_cvs_internal_read on public.student_cvs for select to authenticated
using (public.is_admin() or public.has_role('placement_hr'));

drop policy if exists applications_own_read on public.applications;
create policy applications_own_read on public.applications for select to authenticated
using (exists(select 1 from public.student_profiles sp where sp.id=applications.student_id and sp.user_id=auth.uid()));

drop policy if exists applications_internal_read on public.applications;
create policy applications_internal_read on public.applications for select to authenticated
using (public.is_admin() or public.has_role('placement_hr'));

drop policy if exists application_history_own_read on public.application_status_history;
create policy application_history_own_read on public.application_status_history for select to authenticated
using (exists(select 1 from public.applications a join public.student_profiles sp on sp.id=a.student_id where a.id=application_status_history.application_id and sp.user_id=auth.uid()));

drop policy if exists application_history_internal_read on public.application_status_history;
create policy application_history_internal_read on public.application_status_history for select to authenticated
using (public.is_admin() or public.has_role('placement_hr'));

insert into public.permissions(code,name,description) values
('student.profile.read','Read Student Profile','Read own student placement profile.'),
('student.profile.update','Update Student Profile','Update own student placement profile.'),
('student.cv.read','Read Student CV','Read permitted student CV records.'),
('student.cv.manage','Manage Student CV','Upload, select and remove own CVs.'),
('applications.create','Apply to Jobs','Create an application for a published job.'),
('applications.read.own','Read Own Applications','Read own job applications.')
on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name in ('super_admin','admin') and (p.code like 'student.%' or p.code like 'applications.%')
on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.code in
('student.profile.read','student.profile.update','student.cv.read','student.cv.manage','applications.create','applications.read.own')
where r.name='student' on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.code in ('student.cv.read')
where r.name='placement_hr' on conflict do nothing;

insert into public.system_schema_versions(version,description)
values ('5.0','Student Profile, CV and Applications') on conflict(version) do nothing;

commit;
