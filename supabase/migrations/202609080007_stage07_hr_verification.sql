begin;

-- ============================================================
-- STAGE 7: PLACEMENT HR VERIFICATION
-- ============================================================

alter table public.applications
  add column if not exists verified_match_score numeric(5,2),
  add column if not exists verified_ats_score numeric(5,2),
  add column if not exists verification_notes text,
  add column if not exists rejection_reason text,
  add column if not exists update_request text,
  add column if not exists verified_by uuid references public.profiles(id),
  add column if not exists verified_at timestamptz,
  add column if not exists verification_due_at timestamptz;

do $$ begin
  alter table public.applications add constraint applications_verified_match_score_check
    check (verified_match_score is null or verified_match_score between 0 and 100);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.applications add constraint applications_verified_ats_score_check
    check (verified_ats_score is null or verified_ats_score between 0 and 100);
exception when duplicate_object then null; end $$;

update public.applications
set verification_due_at = coalesce(verification_due_at, updated_at + interval '6 hours')
where status in ('verification_pending','under_verification') and verification_due_at is null;

create table if not exists public.verification_assignments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  assigned_to uuid not null references public.profiles(id),
  assigned_by uuid not null references public.profiles(id),
  assignment_type varchar(20) not null default 'claimed'
    check (assignment_type in ('claimed','manual')),
  status varchar(20) not null default 'active'
    check (status in ('active','completed','released','expired')),
  claimed_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  completed_at timestamptz,
  released_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists verification_assignments_one_active_uidx
  on public.verification_assignments(application_id)
  where status='active';
create index if not exists verification_assignments_assignee_idx
  on public.verification_assignments(assigned_to,status,expires_at);

drop trigger if exists verification_assignments_set_updated_at on public.verification_assignments;
create trigger verification_assignments_set_updated_at before update on public.verification_assignments
for each row execute function public.set_updated_at();

create table if not exists public.application_verifications (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  assignment_id uuid references public.verification_assignments(id),
  verification_status varchar(30) not null
    check (verification_status in ('verified','rejected','update_requested')),
  original_match_score numeric(5,2),
  final_match_score numeric(5,2),
  original_ats_score numeric(5,2),
  final_ats_score numeric(5,2),
  must_have_verified boolean not null default false,
  cv_verified boolean not null default false,
  experience_verified boolean not null default false,
  domain_verified boolean not null default false,
  notes text,
  rejection_reason text,
  update_request text,
  verified_by uuid not null references public.profiles(id),
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists application_verifications_application_idx
  on public.application_verifications(application_id,verified_at desc);

do $$ begin
  alter table public.application_verifications add constraint application_verifications_match_check
    check (final_match_score is null or final_match_score between 0 and 100);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.application_verifications add constraint application_verifications_ats_check
    check (final_ats_score is null or final_ats_score between 0 and 100);
exception when duplicate_object then null; end $$;

create or replace function public.claim_application_verification(p_application_id uuid)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_actor uuid := auth.uid();
  v_job_assignee uuid;
  v_status text;
  v_assignment uuid;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if not (public.is_admin() or public.has_role('placement_hr')) then raise exception 'Not authorized'; end if;

  select a.status,j.assigned_placement_hr into v_status,v_job_assignee
  from public.applications a join public.jobs j on j.id=a.job_id
  where a.id=p_application_id for update of a;
  if v_status is null then raise exception 'Application not found'; end if;
  if public.has_role('placement_hr') and not public.is_admin() and v_job_assignee is distinct from v_actor then
    raise exception 'This application is not assigned to you';
  end if;

  update public.verification_assignments
  set status='expired',updated_at=now()
  where application_id=p_application_id and status='active' and expires_at<=now();

  select id into v_assignment from public.verification_assignments
  where application_id=p_application_id and status='active' and assigned_to=v_actor and expires_at>now()
  limit 1;
  if v_assignment is not null then return v_assignment; end if;

  if exists(select 1 from public.verification_assignments where application_id=p_application_id and status='active' and expires_at>now()) then
    raise exception 'Application is already being verified by another HR user';
  end if;
  if v_status <> 'verification_pending' then raise exception 'Application is not waiting for verification'; end if;

  insert into public.verification_assignments(application_id,assigned_to,assigned_by,assignment_type,status)
  values(p_application_id,v_actor,v_actor,'claimed','active') returning id into v_assignment;

  update public.applications set status='under_verification' where id=p_application_id;
  insert into public.application_status_history(application_id,old_status,new_status,changed_by,metadata)
  values(p_application_id,'verification_pending','under_verification',v_actor,jsonb_build_object('assignment_id',v_assignment));
  insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,new_data)
  values(v_actor,'application',p_application_id,'APPLICATION_VERIFICATION_CLAIMED',jsonb_build_object('assignment_id',v_assignment));
  return v_assignment;
end $$;

create or replace function public.release_application_verification(p_application_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_actor uuid := auth.uid(); v_assignment uuid;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if not (public.is_admin() or public.has_role('placement_hr')) then raise exception 'Not authorized'; end if;
  select id into v_assignment from public.verification_assignments
  where application_id=p_application_id and assigned_to=v_actor and status='active' for update;
  if v_assignment is null and not public.is_admin() then raise exception 'Active verification assignment required'; end if;
  update public.verification_assignments set status='released',released_at=now()
  where application_id=p_application_id and status='active' and (assigned_to=v_actor or public.is_admin());
  update public.applications set status='verification_pending'
  where id=p_application_id and status='under_verification';
  insert into public.application_status_history(application_id,old_status,new_status,changed_by,metadata)
  values(p_application_id,'under_verification','verification_pending',v_actor,jsonb_build_object('assignment_id',v_assignment));
end $$;

create or replace function public.finalize_application_verification(
  p_application_id uuid,
  p_decision varchar,
  p_verified_match_score numeric default null,
  p_verified_ats_score numeric default null,
  p_must_have_verified boolean default false,
  p_cv_verified boolean default false,
  p_experience_verified boolean default false,
  p_domain_verified boolean default false,
  p_notes text default null,
  p_reason text default null,
  p_update_request text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_actor uuid := auth.uid();
  v_app public.applications%rowtype;
  v_job_assignee uuid;
  v_assignment_id uuid;
  v_verification_id uuid;
  v_new_status text;
  v_final_match numeric;
  v_final_ats numeric;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if not (public.is_admin() or public.has_role('placement_hr')) then raise exception 'Not authorized'; end if;
  if p_decision not in ('verified','rejected','update_requested') then raise exception 'Invalid verification decision'; end if;
  if p_decision='rejected' and nullif(trim(coalesce(p_reason,'')),'') is null then raise exception 'Rejection reason is required'; end if;
  if p_decision='update_requested' and nullif(trim(coalesce(p_update_request,'')),'') is null then raise exception 'Update request is required'; end if;
  if p_verified_match_score is not null and p_verified_match_score not between 0 and 100 then raise exception 'Verified match score must be between 0 and 100'; end if;
  if p_verified_ats_score is not null and p_verified_ats_score not between 0 and 100 then raise exception 'Verified ATS score must be between 0 and 100'; end if;
  if p_decision='verified' and not (p_must_have_verified and p_cv_verified and p_experience_verified and p_domain_verified) then
    raise exception 'All verification checks must be confirmed before verification';
  end if;

  select * into v_app from public.applications where id=p_application_id for update;
  if v_app.id is null then raise exception 'Application not found'; end if;
  select assigned_placement_hr into v_job_assignee from public.jobs where id=v_app.job_id;
  if public.has_role('placement_hr') and not public.is_admin() and v_job_assignee is distinct from v_actor then raise exception 'This application is not assigned to you'; end if;
  if v_app.status <> 'under_verification' then raise exception 'Application is not under verification'; end if;

  select id into v_assignment_id from public.verification_assignments
  where application_id=p_application_id and assigned_to=v_actor and status='active' and expires_at>now() limit 1;
  if v_assignment_id is null and not public.is_admin() then raise exception 'Active verification assignment required'; end if;

  v_final_match := coalesce(p_verified_match_score,v_app.match_score);
  v_final_ats := coalesce(p_verified_ats_score,v_app.ats_score);
  v_new_status := case p_decision when 'verified' then 'verified' when 'rejected' then 'rejected_internal' else 'update_requested' end;

  insert into public.application_verifications(
    application_id,assignment_id,verification_status,original_match_score,final_match_score,original_ats_score,final_ats_score,
    must_have_verified,cv_verified,experience_verified,domain_verified,notes,rejection_reason,update_request,verified_by
  ) values(
    p_application_id,v_assignment_id,p_decision,v_app.match_score,v_final_match,v_app.ats_score,v_final_ats,
    p_must_have_verified,p_cv_verified,p_experience_verified,p_domain_verified,nullif(trim(coalesce(p_notes,'')),''),
    case when p_decision='rejected' then trim(p_reason) end,
    case when p_decision='update_requested' then trim(p_update_request) end,v_actor
  ) returning id into v_verification_id;

  update public.applications set
    status=v_new_status,
    verified_match_score=case when p_decision='verified' then v_final_match else verified_match_score end,
    verified_ats_score=case when p_decision='verified' then v_final_ats else verified_ats_score end,
    verification_notes=nullif(trim(coalesce(p_notes,'')),''),
    rejection_reason=case when p_decision='rejected' then trim(p_reason) else null end,
    update_request=case when p_decision='update_requested' then trim(p_update_request) else null end,
    verified_by=v_actor,
    verified_at=now()
  where id=p_application_id;

  update public.verification_assignments set status='completed',completed_at=now()
  where application_id=p_application_id and status='active';

  insert into public.application_status_history(application_id,old_status,new_status,reason,changed_by,metadata)
  values(p_application_id,'under_verification',v_new_status,
    case when p_decision='rejected' then trim(p_reason) when p_decision='update_requested' then trim(p_update_request) else null end,
    v_actor,jsonb_build_object('verification_id',v_verification_id,'effective_match_score',v_final_match,'effective_ats_score',v_final_ats));

  insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,old_data,new_data)
  values(v_actor,'application',p_application_id,'APPLICATION_VERIFICATION_FINALIZED',
    jsonb_build_object('status','under_verification','match_score',v_app.match_score,'ats_score',v_app.ats_score),
    jsonb_build_object('status',v_new_status,'decision',p_decision,'verified_match_score',v_final_match,'verified_ats_score',v_final_ats,'verification_id',v_verification_id));

  insert into public.notification_outbox(event_type,channel,recipient_user_id,entity_type,entity_id,payload,dedupe_key)
  select 'APPLICATION_VERIFICATION_'||upper(p_decision),'in_app',sp.user_id,'application',p_application_id,
    jsonb_build_object('application_id',p_application_id,'decision',p_decision,'status',v_new_status,'reason',case when p_decision='rejected' then p_reason when p_decision='update_requested' then p_update_request end),
    'application:'||p_application_id::text||':verification:'||v_verification_id::text||':in_app'
  from public.student_profiles sp where sp.id=v_app.student_id on conflict do nothing;

  insert into public.notification_outbox(event_type,channel,recipient_user_id,recipient_email,entity_type,entity_id,payload,dedupe_key)
  select 'APPLICATION_VERIFICATION_'||upper(p_decision),'email',sp.user_id,p.email,'application',p_application_id,
    jsonb_build_object('application_id',p_application_id,'decision',p_decision,'status',v_new_status,'reason',case when p_decision='rejected' then p_reason when p_decision='update_requested' then p_update_request end),
    'application:'||p_application_id::text||':verification:'||v_verification_id::text||':email'
  from public.student_profiles sp join public.profiles p on p.id=sp.user_id
  where sp.id=v_app.student_id and p.email is not null on conflict do nothing;

  return v_verification_id;
end $$;

alter table public.verification_assignments enable row level security;
alter table public.application_verifications enable row level security;

drop policy if exists verification_assignments_internal_read on public.verification_assignments;
create policy verification_assignments_internal_read on public.verification_assignments for select to authenticated using(
  public.is_admin() or assigned_to=auth.uid()
  or exists(select 1 from public.applications a join public.jobs j on j.id=a.job_id
            where a.id=verification_assignments.application_id and public.has_role('placement_hr') and j.assigned_placement_hr=auth.uid())
);

drop policy if exists application_verifications_internal_read on public.application_verifications;
create policy application_verifications_internal_read on public.application_verifications for select to authenticated using(
  public.is_admin()
  or exists(select 1 from public.applications a join public.jobs j on j.id=a.job_id
            where a.id=application_verifications.application_id and public.has_role('placement_hr') and j.assigned_placement_hr=auth.uid())
);

revoke all on table public.verification_assignments from anon,authenticated;
revoke all on table public.application_verifications from anon,authenticated;
grant select on table public.verification_assignments to authenticated;
grant select on table public.application_verifications to authenticated;

revoke all on function public.claim_application_verification(uuid) from public,anon;
revoke all on function public.release_application_verification(uuid) from public,anon;
revoke all on function public.finalize_application_verification(uuid,varchar,numeric,numeric,boolean,boolean,boolean,boolean,text,text,text) from public,anon;
grant execute on function public.claim_application_verification(uuid) to authenticated;
grant execute on function public.release_application_verification(uuid) to authenticated;
grant execute on function public.finalize_application_verification(uuid,varchar,numeric,numeric,boolean,boolean,boolean,boolean,text,text,text) to authenticated;

insert into public.permissions(code,name,description) values
('applications.verify','Verify Applications','Claim and finalize Placement HR application verification.'),
('applications.verifications.read','Read Verification Records','Read verification assignments and decision history.')
on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name in ('super_admin','admin','placement_hr') and p.code in ('applications.verify','applications.verifications.read')
on conflict do nothing;

insert into public.system_schema_versions(version,description)
values('7.0','Stage 7 Placement HR application verification and score confirmation')
on conflict(version) do update set description=excluded.description;

commit;
