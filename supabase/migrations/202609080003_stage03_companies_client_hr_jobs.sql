begin;

-- Normalize the Stage-1 compatibility columns to the canonical names used from Stage 3 onward.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='companies' and column_name='company_name')
     and not exists (select 1 from information_schema.columns where table_schema='public' and table_name='companies' and column_name='name') then
    alter table public.companies rename column company_name to name;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='companies' and column_name='company_domain')
     and not exists (select 1 from information_schema.columns where table_schema='public' and table_name='companies' and column_name='domain') then
    alter table public.companies rename column company_domain to domain;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='companies' and column_name='website_url')
     and not exists (select 1 from information_schema.columns where table_schema='public' and table_name='companies' and column_name='website') then
    alter table public.companies rename column website_url to website;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='companies' and column_name='company_size')
     and not exists (select 1 from information_schema.columns where table_schema='public' and table_name='companies' and column_name='size') then
    alter table public.companies rename column company_size to size;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='companies' and column_name='logo_url')
     and not exists (select 1 from information_schema.columns where table_schema='public' and table_name='companies' and column_name='logo') then
    alter table public.companies rename column logo_url to logo;
  end if;
end $$;

alter table public.companies
  add column if not exists rejection_reason text,
  add column if not exists registration_number varchar(150),
  add column if not exists gst_number varchar(50),
  add column if not exists linkedin_url text,
  add column if not exists postal_code varchar(30),
  add column if not exists verification_method varchar(50),
  add column if not exists verification_notes text;

create unique index if not exists companies_domain_uidx
on public.companies(lower(domain)) where domain is not null and deleted_at is null;

-- Job code sequence is human-readable while UUID remains the real key.
create sequence if not exists public.job_code_seq start 1001;

create or replace function public.generate_job_code()
returns text
language sql
volatile
set search_path=public
as $$
  select 'JOB-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.job_code_seq')::text, 6, '0');
$$;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  job_code varchar(32) not null unique default public.generate_job_code(),
  company_id uuid not null references public.companies(id),
  created_by uuid not null references public.profiles(id),
  assigned_placement_hr uuid references public.profiles(id),
  job_title varchar(255) not null,
  role_type varchar(30) not null check (role_type in ('BA','PO','PM','SM')),
  location_type varchar(30) not null default 'domestic' check (location_type in ('domestic','international')),
  location varchar(255),
  country varchar(100),
  employment_type varchar(30) not null default 'full_time' check (employment_type in ('full_time','part_time','contract','internship')),
  workplace_type varchar(30) not null default 'onsite' check (workplace_type in ('onsite','remote','hybrid')),
  experience_min_months integer not null default 0 check (experience_min_months >= 0),
  experience_max_months integer check (experience_max_months is null or experience_max_months >= experience_min_months),
  salary_min numeric(14,2) check (salary_min is null or salary_min >= 0),
  salary_max numeric(14,2) check (salary_max is null or salary_max >= 0),
  salary_currency varchar(10) not null default 'INR',
  openings integer not null default 1 check (openings > 0),
  jd_text text not null,
  application_deadline timestamptz,
  status varchar(30) not null default 'draft' check (status in ('draft','pending_checklist','published','paused','closed','cancelled')),
  submitted_for_checklist_at timestamptz,
  published_by uuid references public.profiles(id),
  published_at timestamptz,
  closed_by uuid references public.profiles(id),
  closed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  constraint jobs_jd_length check (length(trim(jd_text)) >= 50),
  constraint jobs_salary_range check (salary_max is null or salary_min is null or salary_max >= salary_min)
);

create index if not exists jobs_company_idx on public.jobs(company_id, created_at desc) where deleted_at is null;
create index if not exists jobs_status_idx on public.jobs(status, created_at desc) where deleted_at is null;
create index if not exists jobs_assigned_hr_idx on public.jobs(assigned_placement_hr, status) where deleted_at is null;
create index if not exists jobs_created_by_idx on public.jobs(created_by, created_at desc);

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at before update on public.jobs for each row execute function public.set_updated_at();

create table if not exists public.job_status_history (
  id bigint generated always as identity primary key,
  job_id uuid not null references public.jobs(id) on delete cascade,
  old_status varchar(30),
  new_status varchar(30) not null,
  reason text,
  changed_by uuid references public.profiles(id),
  metadata jsonb not null default '{}'::jsonb,
  changed_at timestamptz not null default now()
);
create index if not exists job_status_history_job_idx on public.job_status_history(job_id, changed_at desc);

alter table public.jobs enable row level security;
alter table public.job_status_history enable row level security;

-- Read access is role- and ownership-aware. Writes stay in trusted server services.
drop policy if exists jobs_admin_hr_read on public.jobs;
create policy jobs_admin_hr_read on public.jobs for select to authenticated
using (
  public.is_admin()
  or public.has_role('placement_hr')
  or (
    public.has_role('client_hr')
    and exists (
      select 1 from public.client_hr_profiles ch
      where ch.user_id = auth.uid() and ch.company_id = jobs.company_id and ch.is_active = true
    )
  )
  or (
    public.has_role('student') and status = 'published'
  )
);

drop policy if exists job_status_history_internal_read on public.job_status_history;
create policy job_status_history_internal_read on public.job_status_history for select to authenticated
using (public.is_admin() or public.has_role('placement_hr'));

-- Client HR may read own company's status history as well.
drop policy if exists job_status_history_client_read on public.job_status_history;
create policy job_status_history_client_read on public.job_status_history for select to authenticated
using (
  public.has_role('client_hr') and exists (
    select 1 from public.jobs j
    join public.client_hr_profiles ch on ch.company_id = j.company_id
    where j.id = job_status_history.job_id and ch.user_id = auth.uid() and ch.is_active = true
  )
);

insert into public.permissions(code,name,description) values
('jobs.read','Read Jobs','Read jobs visible to the current role.'),
('jobs.create','Create Jobs','Create job requisitions.'),
('jobs.update','Update Jobs','Update permitted job requisitions.'),
('jobs.submit','Submit Jobs','Submit draft jobs for checklist review.'),
('jobs.assign_hr','Assign Placement HR','Assign Placement HR to a job.')
on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name in ('super_admin','admin') and p.code like 'jobs.%'
on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.code in ('jobs.read','jobs.create','jobs.update','jobs.submit','jobs.assign_hr')
where r.name='placement_hr' on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.code in ('jobs.read','jobs.create','jobs.update','jobs.submit')
where r.name='client_hr' on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.code='jobs.read'
where r.name='student' on conflict do nothing;

insert into public.system_schema_versions(version,description)
values ('3.0','Companies, Client HR and Jobs') on conflict(version) do nothing;

commit;
