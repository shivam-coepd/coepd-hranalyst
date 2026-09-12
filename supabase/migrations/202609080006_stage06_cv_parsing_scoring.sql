begin;

create table if not exists public.parsed_cv_profiles (
  id uuid primary key default gen_random_uuid(),
  cv_id uuid not null references public.student_cvs(id) on delete cascade,
  parser_version text not null,
  extraction_version text not null,
  raw_text text not null,
  raw_text_sha256 text not null,
  page_count integer,
  word_count integer not null default 0,
  character_count integer not null default 0,
  extracted_profile jsonb not null,
  ai_model text,
  ai_response_id text,
  created_at timestamptz not null default now(),
  unique(cv_id, raw_text_sha256, extraction_version)
);
create index if not exists parsed_cv_profiles_cv_idx on public.parsed_cv_profiles(cv_id, created_at desc);

create table if not exists public.application_scores (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  parsed_cv_profile_id uuid not null references public.parsed_cv_profiles(id),
  checklist_id uuid not null references public.job_checklists(id),
  scoring_engine_version text not null,
  match_score numeric(5,2) not null check(match_score between 0 and 100),
  must_have_score numeric(5,2) not null check(must_have_score between 0 and 70),
  good_to_have_score numeric(5,2) not null check(good_to_have_score between 0 and 20),
  tools_score numeric(5,2) not null check(tools_score between 0 and 10),
  must_have_coverage numeric(5,2) not null check(must_have_coverage between 0 and 100),
  good_to_have_coverage numeric(5,2) not null check(good_to_have_coverage between 0 and 100),
  tools_coverage numeric(5,2) not null check(tools_coverage between 0 and 100),
  ats_score numeric(5,2) not null check(ats_score between 0 and 100),
  ats_contact_score numeric(5,2) not null check(ats_contact_score between 0 and 20),
  ats_skills_score numeric(5,2) not null check(ats_skills_score between 0 and 30),
  ats_experience_score numeric(5,2) not null check(ats_experience_score between 0 and 20),
  ats_formatting_score numeric(5,2) not null check(ats_formatting_score between 0 and 15),
  ats_length_score numeric(5,2) not null check(ats_length_score between 0 and 15),
  breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists application_scores_app_idx on public.application_scores(application_id, created_at desc);

create table if not exists public.application_requirement_matches (
  id bigint generated always as identity primary key,
  application_score_id uuid not null references public.application_scores(id) on delete cascade,
  requirement_type text not null check(requirement_type in ('must_have','good_to_have','tool')),
  requirement_name text not null,
  normalized_requirement text not null,
  matched boolean not null,
  matched_cv_term text,
  match_method text not null check(match_method in ('exact','alias','normalized','semantic','manual','none')),
  confidence numeric(4,3) not null check(confidence between 0 and 1),
  evidence text,
  created_at timestamptz not null default now()
);
create index if not exists application_requirement_matches_score_idx on public.application_requirement_matches(application_score_id, requirement_type);

create table if not exists public.application_scoring_runs (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  status text not null check(status in ('processing','completed','failed')),
  attempt integer not null default 1,
  started_by uuid references public.profiles(id),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  application_score_id uuid references public.application_scores(id),
  unique(application_id, attempt)
);
create unique index if not exists application_scoring_one_processing_uidx on public.application_scoring_runs(application_id) where status='processing';

create or replace function public.begin_application_scoring(p_application_id uuid, p_actor_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_run_id uuid; v_attempt int; v_app public.applications%rowtype; v_job public.jobs%rowtype;
begin
  if coalesce(auth.role(),'') <> 'service_role' and auth.uid() is distinct from p_actor_id then raise exception 'Not authorized'; end if;
  select * into v_app from public.applications where id=p_application_id for update;
  if v_app.id is null then raise exception 'Application not found'; end if;
  select * into v_job from public.jobs where id=v_app.job_id;
  if not (public.is_admin() or public.has_role('placement_hr') or coalesce(auth.role(),'')='service_role') then raise exception 'Not authorized'; end if;
  if public.has_role('placement_hr') and not public.is_admin() and v_job.assigned_placement_hr is distinct from p_actor_id then raise exception 'Job is not assigned to you'; end if;
  if exists(select 1 from public.application_scoring_runs where application_id=p_application_id and status='processing') then raise exception 'Application scoring already in progress'; end if;
  select coalesce(max(attempt),0)+1 into v_attempt from public.application_scoring_runs where application_id=p_application_id;
  insert into public.application_scoring_runs(application_id,status,attempt,started_by) values(p_application_id,'processing',v_attempt,p_actor_id) returning id into v_run_id;
  update public.applications set status='scoring',score_status='processing',scoring_error=null where id=p_application_id;
  insert into public.application_status_history(application_id,old_status,new_status,changed_by,metadata)
  values(p_application_id,v_app.status,'scoring',p_actor_id,jsonb_build_object('scoring_run_id',v_run_id));
  return v_run_id;
end $$;

create or replace function public.complete_application_scoring(
  p_application_id uuid,p_run_id uuid,p_actor_id uuid,p_parsed_cv_profile_id uuid,p_match jsonb,p_ats jsonb,p_engine_version text,p_matches jsonb
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_app public.applications%rowtype; v_score_id uuid; v_match numeric; v_ats numeric; v_item jsonb;
begin
  if coalesce(auth.role(),'') <> 'service_role' and auth.uid() is distinct from p_actor_id then raise exception 'Not authorized'; end if;
  select * into v_app from public.applications where id=p_application_id for update;
  if v_app.id is null then raise exception 'Application not found'; end if;
  if not exists(select 1 from public.application_scoring_runs where id=p_run_id and application_id=p_application_id and status='processing') then raise exception 'Scoring run is not active'; end if;
  v_match := (p_match->>'matchScore')::numeric; v_ats := (p_ats->>'atsScore')::numeric;
  insert into public.application_scores(application_id,parsed_cv_profile_id,checklist_id,scoring_engine_version,match_score,must_have_score,good_to_have_score,tools_score,must_have_coverage,good_to_have_coverage,tools_coverage,ats_score,ats_contact_score,ats_skills_score,ats_experience_score,ats_formatting_score,ats_length_score,breakdown)
  values(p_application_id,p_parsed_cv_profile_id,v_app.checklist_id,p_engine_version,v_match,(p_match->>'mustHaveScore')::numeric,(p_match->>'goodToHaveScore')::numeric,(p_match->>'toolsScore')::numeric,(p_match->>'mustHaveCoverage')::numeric,(p_match->>'goodToHaveCoverage')::numeric,(p_match->>'toolsCoverage')::numeric,v_ats,(p_ats->>'contactScore')::numeric,(p_ats->>'skillsScore')::numeric,(p_ats->>'experienceScore')::numeric,(p_ats->>'formattingScore')::numeric,(p_ats->>'lengthScore')::numeric,jsonb_build_object('match',p_match,'ats',p_ats)) returning id into v_score_id;
  for v_item in select * from jsonb_array_elements(coalesce(p_matches,'[]'::jsonb)) loop
    insert into public.application_requirement_matches(application_score_id,requirement_type,requirement_name,normalized_requirement,matched,matched_cv_term,match_method,confidence,evidence)
    values(v_score_id,v_item->>'requirementType',v_item->>'requirementName',v_item->>'normalizedRequirement',coalesce((v_item->>'matched')::boolean,false),nullif(v_item->>'matchedCvTerm',''),v_item->>'method',coalesce((v_item->>'confidence')::numeric,0),nullif(v_item->>'evidence',''));
  end loop;
  update public.applications set match_score=v_match,ats_score=v_ats,score_status='completed',status='verification_pending',scoring_error=null where id=p_application_id;
  update public.application_scoring_runs set status='completed',completed_at=now(),application_score_id=v_score_id where id=p_run_id;
  insert into public.application_status_history(application_id,old_status,new_status,changed_by,metadata) values(p_application_id,'scoring','verification_pending',p_actor_id,jsonb_build_object('application_score_id',v_score_id,'match_score',v_match,'ats_score',v_ats));
  insert into public.audit_logs(actor_user_id,entity_type,entity_id,action,new_data) values(p_actor_id,'application',p_application_id,'APPLICATION_SCORED',jsonb_build_object('application_score_id',v_score_id,'match_score',v_match,'ats_score',v_ats));
  insert into public.notification_outbox(event_type,channel,recipient_user_id,entity_type,entity_id,payload,dedupe_key)
  select 'APPLICATION_SCORING_COMPLETED','in_app',j.assigned_placement_hr,'application',p_application_id,jsonb_build_object('application_id',p_application_id,'match_score',v_match,'ats_score',v_ats),'application:'||p_application_id::text||':scored:'||v_score_id::text
  from public.jobs j where j.id=v_app.job_id and j.assigned_placement_hr is not null on conflict do nothing;
  return v_score_id;
end $$;

create or replace function public.fail_application_scoring(p_application_id uuid,p_run_id uuid,p_actor_id uuid,p_error text)
returns void language plpgsql security definer set search_path=public as $$
begin
  if coalesce(auth.role(),'') <> 'service_role' and auth.uid() is distinct from p_actor_id then raise exception 'Not authorized'; end if;
  update public.application_scoring_runs set status='failed',completed_at=now(),error_message=left(p_error,2000) where id=p_run_id and application_id=p_application_id and status='processing';
  update public.applications set status='scoring_failed',score_status='failed',scoring_error=left(p_error,2000) where id=p_application_id;
  insert into public.application_status_history(application_id,old_status,new_status,reason,changed_by,metadata) values(p_application_id,'scoring','scoring_failed','Automated scoring failed',p_actor_id,jsonb_build_object('scoring_run_id',p_run_id));
end $$;

alter table public.parsed_cv_profiles enable row level security;
alter table public.application_scores enable row level security;
alter table public.application_requirement_matches enable row level security;
alter table public.application_scoring_runs enable row level security;

drop policy if exists parsed_cv_profiles_internal_read on public.parsed_cv_profiles;
create policy parsed_cv_profiles_internal_read on public.parsed_cv_profiles for select to authenticated using(
  public.is_admin()
  or exists(
    select 1
    from public.student_cvs c
    join public.student_profiles s on s.id=c.student_id
    where c.id=parsed_cv_profiles.cv_id and s.user_id=auth.uid()
  )
  or exists(
    select 1
    from public.student_cvs c
    join public.applications a on a.cv_id=c.id
    join public.jobs j on j.id=a.job_id
    where c.id=parsed_cv_profiles.cv_id
      and public.has_role('placement_hr')
      and j.assigned_placement_hr=auth.uid()
  )
);

drop policy if exists application_scores_internal_read on public.application_scores;
create policy application_scores_internal_read on public.application_scores for select to authenticated using(
  public.is_admin()
  or exists(
    select 1 from public.applications a
    join public.student_profiles s on s.id=a.student_id
    where a.id=application_scores.application_id and s.user_id=auth.uid()
  )
  or exists(
    select 1 from public.applications a
    join public.jobs j on j.id=a.job_id
    where a.id=application_scores.application_id
      and public.has_role('placement_hr')
      and j.assigned_placement_hr=auth.uid()
  )
);

drop policy if exists requirement_matches_internal_read on public.application_requirement_matches;
create policy requirement_matches_internal_read on public.application_requirement_matches for select to authenticated using(
  public.is_admin()
  or exists(
    select 1 from public.application_scores sc
    join public.applications a on a.id=sc.application_id
    join public.student_profiles s on s.id=a.student_id
    where sc.id=application_requirement_matches.application_score_id and s.user_id=auth.uid()
  )
  or exists(
    select 1 from public.application_scores sc
    join public.applications a on a.id=sc.application_id
    join public.jobs j on j.id=a.job_id
    where sc.id=application_requirement_matches.application_score_id
      and public.has_role('placement_hr')
      and j.assigned_placement_hr=auth.uid()
  )
);

drop policy if exists scoring_runs_internal_read on public.application_scoring_runs;
create policy scoring_runs_internal_read on public.application_scoring_runs for select to authenticated using(
  public.is_admin()
  or exists(
    select 1 from public.applications a
    join public.jobs j on j.id=a.job_id
    where a.id=application_scoring_runs.application_id
      and public.has_role('placement_hr')
      and j.assigned_placement_hr=auth.uid()
  )
);

-- Scoring state is server-owned. Prevent browsers from calling SECURITY DEFINER RPCs
-- with fabricated scores or completing another user's scoring run directly.
revoke all on function public.begin_application_scoring(uuid,uuid) from public, anon, authenticated;
revoke all on function public.complete_application_scoring(uuid,uuid,uuid,uuid,jsonb,jsonb,text,jsonb) from public, anon, authenticated;
revoke all on function public.fail_application_scoring(uuid,uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.begin_application_scoring(uuid,uuid) to service_role;
grant execute on function public.complete_application_scoring(uuid,uuid,uuid,uuid,jsonb,jsonb,text,jsonb) to service_role;
grant execute on function public.fail_application_scoring(uuid,uuid,uuid,text) to service_role;

insert into public.permissions(code,name,description) values
('applications.score','Score Applications','Run CV parsing, matching and ATS scoring.'),
('applications.scores.read','Read Application Scores','Read automated score breakdown and requirement evidence.')
on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p where r.name in ('super_admin','admin','placement_hr') and p.code in ('applications.score','applications.scores.read') on conflict do nothing;

insert into public.system_schema_versions(version,description) values('6.0','Stage 6 CV parsing, structured extraction, match scoring and ATS scoring') on conflict(version) do update set description=excluded.description;
commit;
