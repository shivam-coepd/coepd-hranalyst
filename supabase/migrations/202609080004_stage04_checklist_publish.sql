begin;

-- ============================================================
-- HRANALYST PLACEMENT WING - STAGE 4
-- AI CHECKLIST + APPROVAL + JOB PUBLISHING + BROADCAST FOUNDATION
-- ============================================================

create table if not exists public.job_checklists (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  version integer not null check (version > 0),
  status varchar(30) not null default 'draft'
    check (status in ('draft','approved','superseded')),
  source varchar(30) not null default 'manual'
    check (source in ('manual','ai','ai_edited')),
  must_have jsonb not null default '[]'::jsonb,
  good_to_have jsonb not null default '[]'::jsonb,
  tools jsonb not null default '[]'::jsonb,
  domain text not null,
  exp_required text not null,
  top_3_skills jsonb not null default '[]'::jsonb,
  checklist_summary text,
  ai_model varchar(150),
  ai_response_id varchar(255),
  prompt_version varchar(100),
  generated_by uuid references public.profiles(id),
  generated_at timestamptz,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_by uuid not null references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(job_id, version),
  check (jsonb_typeof(must_have) = 'array'),
  check (jsonb_typeof(good_to_have) = 'array'),
  check (jsonb_typeof(tools) = 'array'),
  check (jsonb_typeof(top_3_skills) = 'array'),
  check (jsonb_array_length(top_3_skills) <= 3)
);

create unique index if not exists job_checklists_one_draft_idx
  on public.job_checklists(job_id) where status='draft';
create unique index if not exists job_checklists_one_approved_idx
  on public.job_checklists(job_id) where status='approved';
create index if not exists job_checklists_job_version_idx
  on public.job_checklists(job_id, version desc);

drop trigger if exists job_checklists_set_updated_at on public.job_checklists;
create trigger job_checklists_set_updated_at
before update on public.job_checklists
for each row execute function public.set_updated_at();

create table if not exists public.ai_generation_runs (
  id uuid primary key default gen_random_uuid(),
  entity_type varchar(60) not null,
  entity_id uuid not null,
  operation varchar(100) not null,
  provider varchar(50) not null,
  model varchar(150) not null,
  prompt_version varchar(100) not null,
  status varchar(30) not null default 'started'
    check (status in ('started','completed','failed')),
  requested_by uuid not null references public.profiles(id),
  input_snapshot jsonb not null default '{}'::jsonb,
  output_snapshot jsonb,
  response_id varchar(255),
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ai_generation_runs_entity_idx
  on public.ai_generation_runs(entity_type, entity_id, created_at desc);
create index if not exists ai_generation_runs_status_idx
  on public.ai_generation_runs(status, created_at desc);

drop trigger if exists ai_generation_runs_set_updated_at on public.ai_generation_runs;
create trigger ai_generation_runs_set_updated_at
before update on public.ai_generation_runs
for each row execute function public.set_updated_at();

create table if not exists public.job_publications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  checklist_id uuid not null references public.job_checklists(id),
  publication_version integer not null check (publication_version > 0),
  poster_payload jsonb not null default '{}'::jsonb,
  broadcast_in_app boolean not null default true,
  broadcast_email boolean not null default false,
  broadcast_whatsapp boolean not null default false,
  broadcast_telegram boolean not null default false,
  broadcast_summary jsonb not null default '{}'::jsonb,
  broadcast_queued_at timestamptz,
  published_by uuid not null references public.profiles(id),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(job_id, publication_version)
);
create index if not exists job_publications_job_idx
  on public.job_publications(job_id, publication_version desc);

-- The outbox is introduced here because publishing must be able to queue
-- student broadcasts immediately. Later notification stages may extend it.
create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  event_type varchar(100) not null,
  channel varchar(30) not null
    check (channel in ('in_app','email','whatsapp','telegram','calendar')),
  recipient_user_id uuid references public.profiles(id),
  recipient_email varchar(255),
  entity_type varchar(100),
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  status varchar(30) not null default 'pending'
    check (status in ('pending','processing','sent','failed','dead_letter','cancelled')),
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3 check (max_attempts > 0),
  scheduled_for timestamptz not null default now(),
  processing_started_at timestamptz,
  sent_at timestamptz,
  failed_at timestamptz,
  error_message text,
  dedupe_key varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (recipient_user_id is not null or recipient_email is not null)
);
create unique index if not exists notification_outbox_dedupe_idx
  on public.notification_outbox(dedupe_key) where dedupe_key is not null;
create index if not exists notification_outbox_processing_idx
  on public.notification_outbox(status, scheduled_for);

drop trigger if exists notification_outbox_set_updated_at on public.notification_outbox;
create trigger notification_outbox_set_updated_at
before update on public.notification_outbox
for each row execute function public.set_updated_at();

-- Save a generated checklist as the only draft version for a job.
create or replace function public.save_generated_job_checklist(
  p_job_id uuid,
  p_actor_id uuid,
  p_payload jsonb,
  p_ai_model text,
  p_ai_response_id text,
  p_prompt_version text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.jobs%rowtype;
  v_version integer;
  v_id uuid;
  v_is_internal boolean;
begin
  select exists(
    select 1 from public.user_roles ur
    join public.roles r on r.id=ur.role_id
    where ur.user_id=p_actor_id and r.name in ('super_admin','admin','placement_hr')
  ) into v_is_internal;
  if not v_is_internal then raise exception 'Not authorized'; end if;

  select * into v_job from public.jobs where id=p_job_id and deleted_at is null for update;
  if v_job.id is null then raise exception 'Job not found'; end if;
  if v_job.status <> 'pending_checklist' then raise exception 'Job is not awaiting checklist'; end if;

  if exists(
    select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id
    where ur.user_id=p_actor_id and r.name='placement_hr'
  ) and not exists(
    select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id
    where ur.user_id=p_actor_id and r.name in ('super_admin','admin')
  ) and v_job.assigned_placement_hr is distinct from p_actor_id then
    raise exception 'Job is not assigned to this Placement HR';
  end if;

  select coalesce(max(version),0)+1 into v_version
  from public.job_checklists where job_id=p_job_id;

  update public.job_checklists
  set status='superseded', updated_by=p_actor_id
  where job_id=p_job_id and status='draft';

  insert into public.job_checklists(
    job_id,version,status,source,must_have,good_to_have,tools,domain,
    exp_required,top_3_skills,checklist_summary,ai_model,ai_response_id,
    prompt_version,generated_by,generated_at,created_by,updated_by
  ) values (
    p_job_id,v_version,'draft','ai',
    coalesce(p_payload->'must_have','[]'::jsonb),
    coalesce(p_payload->'good_to_have','[]'::jsonb),
    coalesce(p_payload->'tools','[]'::jsonb),
    coalesce(nullif(trim(p_payload->>'domain'),''),'Not specified'),
    coalesce(nullif(trim(p_payload->>'exp_required'),''),'Not specified'),
    coalesce(p_payload->'top_3_skills','[]'::jsonb),
    nullif(trim(p_payload->>'checklist_summary'),''),
    p_ai_model,p_ai_response_id,p_prompt_version,p_actor_id,now(),p_actor_id,p_actor_id
  ) returning id into v_id;

  insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,new_data)
  values (p_actor_id,'job_checklist',v_id,'CHECKLIST_AI_GENERATED',
    jsonb_build_object('job_id',p_job_id,'version',v_version));

  return v_id;
end;
$$;

create or replace function public.approve_job_checklist(
  p_checklist_id uuid,
  p_actor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_c public.job_checklists%rowtype;
  v_job public.jobs%rowtype;
  v_is_internal boolean;
begin
  select exists(
    select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id
    where ur.user_id=p_actor_id and r.name in ('super_admin','admin','placement_hr')
  ) into v_is_internal;
  if not v_is_internal then raise exception 'Not authorized'; end if;

  select * into v_c from public.job_checklists where id=p_checklist_id for update;
  if v_c.id is null or v_c.status <> 'draft' then raise exception 'Checklist draft not found'; end if;
  select * into v_job from public.jobs where id=v_c.job_id and deleted_at is null for update;
  if v_job.id is null or v_job.status <> 'pending_checklist' then raise exception 'Job is not awaiting checklist'; end if;

  if exists(
    select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id
    where ur.user_id=p_actor_id and r.name='placement_hr'
  ) and not exists(
    select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id
    where ur.user_id=p_actor_id and r.name in ('super_admin','admin')
  ) and v_job.assigned_placement_hr is distinct from p_actor_id then
    raise exception 'Job is not assigned to this Placement HR';
  end if;

  if jsonb_array_length(v_c.must_have)=0 then raise exception 'At least one must-have requirement is required'; end if;
  if trim(v_c.domain)='' then raise exception 'Domain is required'; end if;
  if trim(v_c.exp_required)='' then raise exception 'Experience requirement is required'; end if;
  if jsonb_array_length(v_c.top_3_skills)=0 or jsonb_array_length(v_c.top_3_skills)>3 then
    raise exception 'One to three key skills are required';
  end if;

  update public.job_checklists
  set status='superseded', updated_by=p_actor_id
  where job_id=v_c.job_id and status='approved';

  update public.job_checklists
  set status='approved', approved_by=p_actor_id, approved_at=now(), updated_by=p_actor_id
  where id=p_checklist_id;

  insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,new_data)
  values (p_actor_id,'job_checklist',p_checklist_id,'CHECKLIST_APPROVED',
    jsonb_build_object('job_id',v_c.job_id));

  return p_checklist_id;
end;
$$;

create or replace function public.publish_job_stage4(
  p_job_id uuid,
  p_actor_id uuid,
  p_poster_payload jsonb,
  p_broadcast_options jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.jobs%rowtype;
  v_company public.companies%rowtype;
  v_checklist_id uuid;
  v_version integer;
  v_publication_id uuid;
  v_is_internal boolean;
begin
  select exists(
    select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id
    where ur.user_id=p_actor_id and r.name in ('super_admin','admin','placement_hr')
  ) into v_is_internal;
  if not v_is_internal then raise exception 'Not authorized'; end if;

  select * into v_job from public.jobs where id=p_job_id and deleted_at is null for update;
  if v_job.id is null then raise exception 'Job not found'; end if;
  if v_job.status <> 'pending_checklist' then raise exception 'Job is not ready for publishing'; end if;

  if exists(
    select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id
    where ur.user_id=p_actor_id and r.name='placement_hr'
  ) and not exists(
    select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id
    where ur.user_id=p_actor_id and r.name in ('super_admin','admin')
  ) and v_job.assigned_placement_hr is distinct from p_actor_id then
    raise exception 'Job is not assigned to this Placement HR';
  end if;

  select * into v_company from public.companies where id=v_job.company_id and deleted_at is null;
  if v_company.id is null or v_company.verification_status <> 'verified' or v_company.is_active=false then
    raise exception 'Verified active company required';
  end if;

  select id into v_checklist_id from public.job_checklists
  where job_id=p_job_id and status='approved' order by version desc limit 1;
  if v_checklist_id is null then raise exception 'Approved checklist required before publishing'; end if;

  select coalesce(max(publication_version),0)+1 into v_version
  from public.job_publications where job_id=p_job_id;

  insert into public.job_publications(
    job_id,checklist_id,publication_version,poster_payload,
    broadcast_in_app,broadcast_email,broadcast_whatsapp,broadcast_telegram,published_by
  ) values (
    p_job_id,v_checklist_id,v_version,coalesce(p_poster_payload,'{}'::jsonb),
    true,
    coalesce((p_broadcast_options->>'email')::boolean,false),
    coalesce((p_broadcast_options->>'whatsapp')::boolean,false),
    coalesce((p_broadcast_options->>'telegram')::boolean,false),
    p_actor_id
  ) returning id into v_publication_id;

  update public.jobs set status='published', published_by=p_actor_id, published_at=now()
  where id=p_job_id;

  insert into public.job_status_history(job_id,old_status,new_status,changed_by,metadata)
  values (p_job_id,'pending_checklist','published',p_actor_id,
    jsonb_build_object('publication_id',v_publication_id,'checklist_id',v_checklist_id));

  insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,old_data,new_data)
  values (p_actor_id,'job',p_job_id,'JOB_PUBLISHED',
    jsonb_build_object('status','pending_checklist'),
    jsonb_build_object('status','published','publication_id',v_publication_id,'checklist_id',v_checklist_id));

  return v_publication_id;
end;
$$;

revoke all on function public.save_generated_job_checklist(uuid,uuid,jsonb,text,text,text) from public;
revoke all on function public.approve_job_checklist(uuid,uuid) from public;
revoke all on function public.publish_job_stage4(uuid,uuid,jsonb,jsonb) from public;
grant execute on function public.save_generated_job_checklist(uuid,uuid,jsonb,text,text,text) to service_role;
grant execute on function public.approve_job_checklist(uuid,uuid) to service_role;
grant execute on function public.publish_job_stage4(uuid,uuid,jsonb,jsonb) to service_role;

alter table public.job_checklists enable row level security;
alter table public.ai_generation_runs enable row level security;
alter table public.job_publications enable row level security;
alter table public.notification_outbox enable row level security;

-- Read-only browser policies; all mutations are through trusted server services.
drop policy if exists job_checklists_internal_read on public.job_checklists;
create policy job_checklists_internal_read on public.job_checklists for select to authenticated
using (
  public.is_admin()
  or (public.has_role('placement_hr') and exists(
    select 1 from public.jobs j where j.id=job_checklists.job_id and j.assigned_placement_hr=auth.uid()
  ))
);

drop policy if exists job_checklists_client_read on public.job_checklists;
create policy job_checklists_client_read on public.job_checklists for select to authenticated
using (
  public.has_role('client_hr') and status='approved' and exists(
    select 1 from public.jobs j
    join public.client_hr_profiles ch on ch.company_id=j.company_id
    where j.id=job_checklists.job_id and ch.user_id=auth.uid() and ch.is_active=true
  )
);

drop policy if exists job_checklists_student_read on public.job_checklists;
create policy job_checklists_student_read on public.job_checklists for select to authenticated
using (
  public.has_role('student') and status='approved' and exists(
    select 1 from public.jobs j where j.id=job_checklists.job_id and j.status='published' and j.deleted_at is null
  )
);

drop policy if exists ai_generation_runs_internal_read on public.ai_generation_runs;
create policy ai_generation_runs_internal_read on public.ai_generation_runs for select to authenticated
using (
  public.is_admin()
  or (public.has_role('placement_hr') and entity_type='job' and exists(
    select 1 from public.jobs j where j.id=ai_generation_runs.entity_id and j.assigned_placement_hr=auth.uid()
  ))
);

drop policy if exists job_publications_internal_read on public.job_publications;
create policy job_publications_internal_read on public.job_publications for select to authenticated
using (
  public.is_admin()
  or (public.has_role('placement_hr') and exists(
    select 1 from public.jobs j where j.id=job_publications.job_id and j.assigned_placement_hr=auth.uid()
  ))
);

drop policy if exists job_publications_client_read on public.job_publications;
create policy job_publications_client_read on public.job_publications for select to authenticated
using (
  public.has_role('client_hr') and exists(
    select 1 from public.jobs j
    join public.client_hr_profiles ch on ch.company_id=j.company_id
    where j.id=job_publications.job_id and ch.user_id=auth.uid() and ch.is_active=true
  )
);

insert into public.permissions(code,name,description) values
('checklists.read','Read Checklists','Read job screening checklists.'),
('checklists.generate','Generate Checklists','Generate AI screening checklists.'),
('checklists.update','Update Checklists','Edit draft screening checklists.'),
('checklists.approve','Approve Checklists','Approve screening checklists.'),
('jobs.publish','Publish Jobs','Publish a job after checklist approval.')
on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name in ('super_admin','admin') and p.code in ('checklists.read','checklists.generate','checklists.update','checklists.approve','jobs.publish')
on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name='placement_hr' and p.code in ('checklists.read','checklists.generate','checklists.update','checklists.approve','jobs.publish')
on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name='client_hr' and p.code='checklists.read'
on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name='student' and p.code='checklists.read'
on conflict do nothing;

insert into public.system_schema_versions(version,description)
values ('4.0','AI checklist approval, job publishing and broadcast foundation')
on conflict(version) do nothing;

commit;
