begin;
alter table public.student_profiles add column if not exists current_ctc numeric(14,2) check(current_ctc>=0);
alter table public.student_profiles add column if not exists expected_ctc numeric(14,2) check(expected_ctc>=0);

create or replace function public.has_role(requested_role text) returns boolean
language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id
 join public.profiles p on p.id=ur.user_id where ur.user_id=auth.uid() and p.account_status='approved' and r.name=requested_role);
$$;
revoke all on function public.has_role(text) from public,anon;
grant execute on function public.has_role(text) to authenticated,service_role;

create or replace function public.create_platform_user(
 p_user_id uuid,p_role_id uuid,p_assigned_by uuid,p_first_name text,p_last_name text,
 p_phone text,p_email text,p_role text,p_enrollment_id text,p_verification_reference text,
 p_verified_by uuid,p_company_id uuid,p_work_email text
) returns uuid language plpgsql security definer set search_path=public as $$
declare actor_super boolean;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Service role required'; end if;
 select exists(select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id join public.profiles p on p.id=ur.user_id where ur.user_id=p_assigned_by and r.name='super_admin' and p.account_status='approved') into actor_super;
 if not actor_super and not exists(select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id join public.profiles p on p.id=ur.user_id where ur.user_id=p_assigned_by and r.name='admin' and p.account_status='approved') then raise exception 'Administrator required'; end if;
 if p_role not in ('admin','placement_hr','client_hr','student') or (p_role='admin' and not actor_super) then raise exception 'Role assignment not permitted'; end if;
 if not exists(select 1 from public.roles where id=p_role_id and name=p_role) then raise exception 'Invalid role'; end if;
 if exists(select 1 from public.user_roles where user_id=p_user_id) then raise exception 'User already provisioned'; end if;
 if p_role='student' and (nullif(trim(p_enrollment_id),'') is null or nullif(trim(p_verification_reference),'') is null or p_verified_by is distinct from p_assigned_by) then raise exception 'Verified enrollment required'; end if;
 if p_role='client_hr' and not exists(select 1 from public.companies where id=p_company_id and verification_status='verified' and is_active and deleted_at is null and lower(domain)=lower(split_part(p_email,'@',2))) then raise exception 'Verified matching company required'; end if;
 update public.profiles set first_name=p_first_name,last_name=p_last_name,phone=p_phone,email=lower(p_email),account_status='pending' where id=p_user_id;
 if not found then raise exception 'Auth profile missing'; end if;
 insert into public.user_roles(user_id,role_id,assigned_by) values(p_user_id,p_role_id,p_assigned_by);
 if p_role='student' then
  insert into public.student_profiles(user_id,enrollment_id,first_name,last_name,phone,verification_status,verification_reference,verified_by,verification_at)
  values(p_user_id,p_enrollment_id,p_first_name,p_last_name,p_phone,'verified',p_verification_reference,p_verified_by,now());
 elsif p_role='client_hr' then
  insert into public.client_hr_profiles(user_id,company_id,work_email) values(p_user_id,p_company_id,p_work_email);
 elsif p_role='placement_hr' then
  insert into public.placement_hr_profiles(user_id,work_email) values(p_user_id,p_work_email);
 end if;
 insert into public.audit_logs(actor_id,action,entity_type,entity_id,new_values) values(p_assigned_by,'USER_CREATED','profile',p_user_id,jsonb_build_object('role',p_role,'status','pending'));
 return p_user_id;
end;
$$;
revoke all on function public.create_platform_user(uuid,uuid,uuid,text,text,text,text,text,text,text,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.create_platform_user(uuid,uuid,uuid,text,text,text,text,text,text,text,uuid,uuid,text) to service_role;

-- Enforce the canonical assigned-job boundary for Placement HR reads.
drop policy if exists jobs_admin_hr_read on public.jobs;
create policy jobs_admin_hr_read on public.jobs for select to authenticated using (
 public.is_admin()
 or (public.has_role('placement_hr') and assigned_placement_hr=auth.uid())
 or (public.has_role('client_hr') and exists (
  select 1 from public.client_hr_profiles ch where ch.user_id=auth.uid() and ch.company_id=jobs.company_id and ch.is_active=true
 ))
 or (public.has_role('student') and status='published')
);
drop policy if exists job_status_history_internal_read on public.job_status_history;
create policy job_status_history_internal_read on public.job_status_history for select to authenticated using (
 public.is_admin() or exists(select 1 from public.jobs j where j.id=job_status_history.job_id and public.has_role('placement_hr') and j.assigned_placement_hr=auth.uid())
);
drop policy if exists applications_internal_read on public.applications;
create policy applications_internal_read on public.applications for select to authenticated using (
 public.is_admin() or exists(select 1 from public.jobs j where j.id=applications.job_id and public.has_role('placement_hr') and j.assigned_placement_hr=auth.uid())
);
drop policy if exists application_history_internal_read on public.application_status_history;
create policy application_history_internal_read on public.application_status_history for select to authenticated using (
 public.is_admin() or exists(select 1 from public.applications a join public.jobs j on j.id=a.job_id where a.id=application_status_history.application_id and public.has_role('placement_hr') and j.assigned_placement_hr=auth.uid())
);
drop policy if exists student_cvs_internal_read on public.student_cvs;
create policy student_cvs_internal_read on public.student_cvs for select to authenticated using (
 public.is_admin() or exists(select 1 from public.applications a join public.jobs j on j.id=a.job_id where a.cv_id=student_cvs.id and public.has_role('placement_hr') and j.assigned_placement_hr=auth.uid())
);
insert into public.system_schema_versions(version,description) values('17.0','Recovery: transactional user provisioning and approved-account role checks');
commit;
