-- HRANALYST PLACEMENT WING - STAGE 8
-- Submit verified candidates to Client HR.

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  submission_code varchar(50) not null unique,
  job_id uuid not null references public.jobs(id),
  company_id uuid not null references public.companies(id),
  submitted_by uuid not null references public.profiles(id),
  status varchar(30) not null default 'submitted' check (status in ('draft','submitted','acknowledged','cancelled')),
  notes text,
  candidate_count integer not null default 0 check (candidate_count >= 0),
  submitted_at timestamptz,
  acknowledged_at timestamptz,
  acknowledged_by uuid references public.profiles(id),
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles(id),
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submission_candidates (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  application_id uuid not null references public.applications(id),
  student_id uuid not null references public.student_profiles(id),
  cv_id uuid not null references public.student_cvs(id),
  status varchar(40) not null default 'submitted' check (status in ('submitted','shortlisted','rejected','interview_scheduled','selected','on_hold','offer_received','offer_accepted','placed','withdrawn')),
  candidate_snapshot jsonb not null default '{}'::jsonb,
  submitted_match_score numeric(5,2) not null check (submitted_match_score between 0 and 100),
  submitted_ats_score numeric(5,2) check (submitted_ats_score between 0 and 100),
  current_mock_score numeric(5,2) check (current_mock_score between 0 and 100),
  client_decision_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (submission_id, application_id)
);

create unique index if not exists submission_candidates_application_active_uidx
on public.submission_candidates(application_id)
where status <> 'withdrawn';
create index if not exists submissions_job_idx on public.submissions(job_id, submitted_at desc);
create index if not exists submissions_company_idx on public.submissions(company_id, submitted_at desc);
create index if not exists submission_candidates_submission_idx on public.submission_candidates(submission_id);
create index if not exists submission_candidates_student_idx on public.submission_candidates(student_id);

alter table public.applications add column if not exists submitted_to_client_at timestamptz;
alter table public.applications add column if not exists submitted_by uuid references public.profiles(id);

create sequence if not exists public.stage08_submission_code_seq start 1;

create or replace function public.next_submission_code()
returns text language sql security definer set search_path=public as $$
  select 'SUB-' || to_char(current_date,'YYYY') || '-' || lpad(nextval('public.stage08_submission_code_seq')::text,6,'0')
$$;
revoke all on function public.next_submission_code() from public, anon, authenticated;
grant execute on function public.next_submission_code() to service_role;

create or replace function public.create_client_submission(
  p_job_id uuid,
  p_application_ids uuid[],
  p_notes text default null
) returns uuid
language plpgsql security definer set search_path=public as $$
declare
  v_actor uuid := auth.uid();
  v_company uuid;
  v_submission uuid;
  v_code text;
  v_app record;
  v_effective_match numeric;
  v_effective_ats numeric;
  v_snapshot jsonb;
  v_count integer := 0;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if not (public.is_admin() or public.has_role('placement_hr')) then raise exception 'Not authorized'; end if;
  if p_application_ids is null or cardinality(p_application_ids)=0 then raise exception 'Select at least one candidate'; end if;

  select company_id into v_company from public.jobs
  where id=p_job_id and deleted_at is null and status in ('published','paused','closed')
    and (public.is_admin() or assigned_placement_hr=v_actor);
  if v_company is null then raise exception 'Job not found or not assigned to you'; end if;

  v_code := public.next_submission_code();
  insert into public.submissions(submission_code,job_id,company_id,submitted_by,status,notes,submitted_at)
  values(v_code,p_job_id,v_company,v_actor,'submitted',nullif(trim(p_notes),''),now()) returning id into v_submission;

  for v_app in
    select a.*, sp.enrollment_id, sp.headline, sp.total_experience_months, sp.current_company,
           sp.current_designation, sp.city, sp.state, sp.country, sp.notice_period_days,
           sp.preferred_role, sp.skills, p.first_name, p.last_name, p.email, p.phone,
           scv.original_file_name
    from public.applications a
    join public.student_profiles sp on sp.id=a.student_id
    join public.profiles p on p.id=sp.user_id
    join public.student_cvs scv on scv.id=a.cv_id and scv.deleted_at is null
    where a.id=any(p_application_ids) and a.job_id=p_job_id
    for update of a
  loop
    if v_app.status <> 'verified' then raise exception 'All candidates must be verified'; end if;
    v_effective_match := coalesce(v_app.verified_match_score,v_app.match_score);
    v_effective_ats := coalesce(v_app.verified_ats_score,v_app.ats_score);
    if v_effective_match is null or v_effective_match < 60 then
      raise exception 'Candidate % does not meet the 60%% Match Score gate', v_app.id;
    end if;
    if exists(select 1 from public.submission_candidates where application_id=v_app.id and status <> 'withdrawn') then
      raise exception 'Candidate % has already been submitted', v_app.id;
    end if;

    v_snapshot := jsonb_build_object(
      'candidate_name', trim(coalesce(v_app.first_name,'') || ' ' || coalesce(v_app.last_name,'')),
      'enrollment_id', v_app.enrollment_id,
      'email', v_app.email,
      'phone', v_app.phone,
      'headline', v_app.headline,
      'total_experience_months', v_app.total_experience_months,
      'current_company', v_app.current_company,
      'current_designation', v_app.current_designation,
      'location', concat_ws(', ',v_app.city,v_app.state,v_app.country),
      'notice_period_days', v_app.notice_period_days,
      'preferred_role', v_app.preferred_role,
      'skills', coalesce(v_app.skills,'[]'::jsonb),
      'cv_file_name', v_app.original_file_name
    );

    insert into public.submission_candidates(submission_id,application_id,student_id,cv_id,status,candidate_snapshot,submitted_match_score,submitted_ats_score)
    values(v_submission,v_app.id,v_app.student_id,v_app.cv_id,'submitted',v_snapshot,v_effective_match,v_effective_ats);

    update public.applications set status='submitted_to_client',submitted_to_client_at=now(),submitted_by=v_actor,updated_at=now() where id=v_app.id;
    insert into public.application_status_history(application_id,old_status,new_status,reason,changed_by,metadata)
    values(v_app.id,'verified','submitted_to_client','Submitted to Client HR',v_actor,jsonb_build_object('submission_id',v_submission));
    v_count := v_count + 1;
  end loop;

  if v_count <> cardinality(p_application_ids) then raise exception 'One or more selected applications were not found'; end if;
  update public.submissions set candidate_count=v_count,updated_at=now() where id=v_submission;

  insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,new_data,metadata)
  values(v_actor,'submission',v_submission,'CLIENT_SUBMISSION_CREATED',jsonb_build_object('job_id',p_job_id,'company_id',v_company,'candidate_count',v_count),jsonb_build_object('application_ids',to_jsonb(p_application_ids)));

  insert into public.notification_outbox(event_type,channel,recipient_user_id,recipient_email,entity_type,entity_id,payload,dedupe_key)
  select 'CANDIDATES_SUBMITTED_TO_CLIENT','in_app',chp.user_id,p.email,'submission',v_submission,
         jsonb_build_object('submission_id',v_submission,'submission_code',v_code,'job_id',p_job_id,'candidate_count',v_count),
         'submission:'||v_submission||':in_app:'||chp.user_id
  from public.client_hr_profiles chp join public.profiles p on p.id=chp.user_id
  where chp.company_id=v_company and chp.is_active=true and p.account_status='approved';

  insert into public.notification_outbox(event_type,channel,recipient_user_id,recipient_email,entity_type,entity_id,payload,dedupe_key)
  select 'CANDIDATES_SUBMITTED_TO_CLIENT','email',chp.user_id,p.email,'submission',v_submission,
         jsonb_build_object('submission_id',v_submission,'submission_code',v_code,'job_id',p_job_id,'candidate_count',v_count),
         'submission:'||v_submission||':email:'||chp.user_id
  from public.client_hr_profiles chp join public.profiles p on p.id=chp.user_id
  where chp.company_id=v_company and chp.is_active=true and p.account_status='approved';
  return v_submission;
end $$;
revoke all on function public.create_client_submission(uuid,uuid[],text) from public,anon;
grant execute on function public.create_client_submission(uuid,uuid[],text) to authenticated;

revoke insert, update, delete, truncate, references, trigger on public.submissions from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.submission_candidates from anon, authenticated;
grant select on public.submissions, public.submission_candidates to authenticated;

alter table public.submissions enable row level security;
alter table public.submission_candidates enable row level security;

create policy submissions_admin_read on public.submissions for select to authenticated using (public.is_admin());
create policy submissions_placement_read on public.submissions for select to authenticated using (
  public.has_role('placement_hr') and exists(select 1 from public.jobs j where j.id=job_id and j.assigned_placement_hr=auth.uid())
);
create policy submissions_client_read on public.submissions for select to authenticated using (
  public.has_role('client_hr') and exists(select 1 from public.client_hr_profiles c where c.user_id=auth.uid() and c.company_id=company_id and c.is_active=true)
);
create policy submission_candidates_admin_read on public.submission_candidates for select to authenticated using (public.is_admin());
create policy submission_candidates_placement_read on public.submission_candidates for select to authenticated using (
  public.has_role('placement_hr') and exists(select 1 from public.submissions s join public.jobs j on j.id=s.job_id where s.id=submission_id and j.assigned_placement_hr=auth.uid())
);
create policy submission_candidates_client_read on public.submission_candidates for select to authenticated using (
  public.has_role('client_hr') and exists(select 1 from public.submissions s join public.client_hr_profiles c on c.company_id=s.company_id where s.id=submission_id and c.user_id=auth.uid() and c.is_active=true)
);

insert into public.permissions(code,name,description) values
('submissions.read','Read submissions','Read candidate submissions'),
('submissions.create','Create submissions','Submit verified candidates to clients'),
('submissions.cv.read','Read submitted CV','Access submitted candidate CVs')
on conflict(code) do update set name=excluded.name,description=excluded.description;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name in ('super_admin','admin','placement_hr') and p.code in ('submissions.read','submissions.create','submissions.cv.read') on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name='client_hr' and p.code in ('submissions.read','submissions.cv.read') on conflict do nothing;

insert into public.system_schema_versions(version,description) values('8.0','Client submission, immutable candidate snapshots and secure client CV access') on conflict(version) do nothing;
