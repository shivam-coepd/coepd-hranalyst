-- ============================================================
-- HRANALYST PLACEMENT WING
-- STAGE 01
-- FOUNDATION
-- ============================================================

begin;


-- ============================================================
-- 1. REQUIRED EXTENSIONS
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- 2. COMMON UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin

    new.updated_at := now();

    return new;

end;
$$;


-- ============================================================
-- 3. PROFILES
-- One profile for every Supabase Auth user.
-- profiles.id MUST equal auth.users.id.
-- ============================================================

create table if not exists public.profiles (

    id uuid primary key
        references auth.users(id)
        on delete cascade,

    first_name varchar(120),

    last_name varchar(120),

    email varchar(320)
        not null,

    phone varchar(30),

    avatar_url text,

    account_status varchar(30)
        not null default 'pending'
        check (
            account_status in (
                'pending',
                'approved',
                'rejected',
                'suspended',
                'inactive'
            )
        ),

    approved_at timestamptz,

    approved_by uuid
        references public.profiles(id),

    rejected_at timestamptz,

    rejected_by uuid
        references public.profiles(id),

    rejection_reason text,

    suspended_at timestamptz,

    suspended_by uuid
        references public.profiles(id),

    suspension_reason text,

    last_login_at timestamptz,

    created_at timestamptz
        not null default now(),

    updated_at timestamptz
        not null default now(),

    constraint profiles_email_not_blank
        check (
            length(
                trim(email)
            ) > 0
        )
);


create unique index if not exists
profiles_email_lower_uidx
on public.profiles(
    lower(email)
);


create index if not exists
profiles_account_status_idx
on public.profiles(
    account_status
);


drop trigger if exists
profiles_set_updated_at
on public.profiles;

create trigger
profiles_set_updated_at
before update
on public.profiles
for each row
execute function public.set_updated_at();


-- ============================================================
-- 4. ROLES
-- ============================================================

create table if not exists public.roles (

    id uuid primary key
        default gen_random_uuid(),

    name varchar(50)
        not null,

    display_name varchar(100)
        not null,

    description text,

    is_system boolean
        not null default true,

    created_at timestamptz
        not null default now(),

    updated_at timestamptz
        not null default now()
);


create unique index if not exists
roles_name_uidx
on public.roles(
    lower(name)
);


drop trigger if exists
roles_set_updated_at
on public.roles;

create trigger
roles_set_updated_at
before update
on public.roles
for each row
execute function public.set_updated_at();


-- ============================================================
-- 5. PERMISSIONS
-- ============================================================

create table if not exists public.permissions (

    id uuid primary key
        default gen_random_uuid(),

    code varchar(100)
        not null,

    name varchar(150)
        not null,

    description text,

    created_at timestamptz
        not null default now(),

    updated_at timestamptz
        not null default now()
);


create unique index if not exists
permissions_code_uidx
on public.permissions(
    lower(code)
);


drop trigger if exists
permissions_set_updated_at
on public.permissions;

create trigger
permissions_set_updated_at
before update
on public.permissions
for each row
execute function public.set_updated_at();


-- ============================================================
-- 6. ROLE PERMISSIONS
-- ============================================================

create table if not exists public.role_permissions (

    role_id uuid not null
        references public.roles(id)
        on delete cascade,

    permission_id uuid not null
        references public.permissions(id)
        on delete cascade,

    created_at timestamptz
        not null default now(),

    primary key (
        role_id,
        permission_id
    )
);


-- ============================================================
-- 7. USER ROLES
-- ============================================================

create table if not exists public.user_roles (

    id uuid primary key
        default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    role_id uuid not null
        references public.roles(id)
        on delete cascade,

    assigned_by uuid
        references public.profiles(id),

    assigned_at timestamptz
        not null default now(),

    created_at timestamptz
        not null default now(),

    unique (
        user_id,
        role_id
    )
);


create index if not exists
user_roles_user_id_idx
on public.user_roles(
    user_id
);


create index if not exists
user_roles_role_id_idx
on public.user_roles(
    role_id
);


-- ============================================================
-- 8. COMPANIES
-- CANONICAL COLUMN NAMES.
-- ============================================================

create table if not exists public.companies (

    id uuid primary key
        default gen_random_uuid(),

    name varchar(255)
        not null,

    legal_name varchar(255),

    code varchar(100),

    domain varchar(255),

    website text,

    industry varchar(150),

    size varchar(100),

    registration_number varchar(150),

    gst_number varchar(50),

    linkedin_url text,

    primary_email varchar(320),

    primary_phone varchar(30),

    address text,

    city varchar(150),

    state varchar(150),

    country varchar(150),

    postal_code varchar(30),

    logo text,

    verification_status varchar(30)
        not null default 'pending'
        check (
            verification_status in (
                'pending',
                'verified',
                'rejected'
            )
        ),

    verification_method varchar(50),

    verification_notes text,

    verified_at timestamptz,

    verified_by uuid
        references public.profiles(id),

    is_active boolean
        not null default true,

    created_by uuid
        references public.profiles(id),

    created_at timestamptz
        not null default now(),

    updated_at timestamptz
        not null default now(),

    deleted_at timestamptz,

    deleted_by uuid
        references public.profiles(id),

    constraint companies_name_not_blank
        check (
            length(
                trim(name)
            ) > 0
        )
);


create unique index if not exists
companies_code_uidx
on public.companies(
    lower(code)
)
where code is not null;


create unique index if not exists
companies_domain_uidx
on public.companies(
    lower(domain)
)
where domain is not null
and deleted_at is null;


create index if not exists
companies_verification_status_idx
on public.companies(
    verification_status
);


create index if not exists
companies_active_idx
on public.companies(
    is_active
)
where deleted_at is null;


drop trigger if exists
companies_set_updated_at
on public.companies;

create trigger
companies_set_updated_at
before update
on public.companies
for each row
execute function public.set_updated_at();


-- ============================================================
-- 9. CLIENT HR PROFILE
-- ============================================================

create table if not exists public.client_hr_profiles (

    id uuid primary key
        default gen_random_uuid(),

    user_id uuid not null unique
        references public.profiles(id)
        on delete cascade,

    company_id uuid not null
        references public.companies(id),

    employee_code varchar(100),

    designation varchar(150),

    department varchar(150),

    work_email varchar(320),

    work_phone varchar(30),

    linkedin_url text,

    is_primary_contact boolean
        not null default false,

    is_active boolean
        not null default true,

    created_at timestamptz
        not null default now(),

    updated_at timestamptz
        not null default now()
);


create index if not exists
client_hr_profiles_company_id_idx
on public.client_hr_profiles(
    company_id
);


create index if not exists
client_hr_profiles_active_idx
on public.client_hr_profiles(
    is_active
);


drop trigger if exists
client_hr_profiles_set_updated_at
on public.client_hr_profiles;

create trigger
client_hr_profiles_set_updated_at
before update
on public.client_hr_profiles
for each row
execute function public.set_updated_at();


-- ============================================================
-- 10. PLACEMENT HR PROFILE
-- ============================================================

create table if not exists public.placement_hr_profiles (

    id uuid primary key
        default gen_random_uuid(),

    user_id uuid not null unique
        references public.profiles(id)
        on delete cascade,

    employee_code varchar(100),

    designation varchar(150),

    department varchar(150),

    work_email varchar(320),

    work_phone varchar(30),

    is_active boolean
        not null default true,

    created_at timestamptz
        not null default now(),

    updated_at timestamptz
        not null default now()
);


drop trigger if exists
placement_hr_profiles_set_updated_at
on public.placement_hr_profiles;

create trigger
placement_hr_profiles_set_updated_at
before update
on public.placement_hr_profiles
for each row
execute function public.set_updated_at();


-- ============================================================
-- 11. STUDENT PROFILE
--
-- enrollment_id is deliberately UNIQUE.
-- The actual external-HRAnalyst validation happens in Stage 2.
-- ============================================================

create table if not exists public.student_profiles (

    id uuid primary key
        default gen_random_uuid(),

    user_id uuid not null unique
        references public.profiles(id)
        on delete cascade,

    enrollment_id varchar(100)
        not null,

    verification_status varchar(30)
        not null default 'pending'
        check (
            verification_status in (
                'pending',
                'verified',
                'rejected'
            )
        ),

    verification_source varchar(100),

    verification_reference text,

    verification_at timestamptz,

    verified_by uuid
        references public.profiles(id),

    verification_reason text,

    first_name varchar(120),

    last_name varchar(120),

    phone varchar(30),

    headline varchar(255),

    summary text,

    location varchar(255),

    city varchar(150),

    state varchar(150),

    country varchar(150),

    postal_code varchar(30),

    qualification varchar(255),

    graduation_year integer,

    specialization varchar(255),

    total_experience_months integer
        not null default 0,

    current_company varchar(255),

    current_designation varchar(255),

    current_ctc numeric(14,2),

    current_ctc_currency varchar(10)
        default 'INR',

    notice_period_days integer,

    preferred_role varchar(100),

    preferred_location varchar(255),

    willing_to_relocate boolean
        default false,

    linkedin_url text,

    github_url text,

    portfolio_url text,

    profile_completion integer
        not null default 0
        check (
            profile_completion
            between 0 and 100
        ),

    profile_status varchar(30)
        not null default 'active'
        check (
            profile_status in (
                'active',
                'inactive',
                'placed',
                'archived'
            )
        ),

    created_at timestamptz
        not null default now(),

    updated_at timestamptz
        not null default now(),

    constraint student_profiles_experience_check
        check (
            total_experience_months >= 0
        ),

    constraint student_profiles_graduation_year_check
        check (
            graduation_year is null
            or graduation_year between 1950 and 2100
        ),

    constraint student_profiles_notice_period_check
        check (
            notice_period_days is null
            or notice_period_days >= 0
        )
);


create unique index if not exists
student_profiles_enrollment_id_uidx
on public.student_profiles(
    lower(enrollment_id)
);


create index if not exists
student_profiles_verification_status_idx
on public.student_profiles(
    verification_status
);


create index if not exists
student_profiles_profile_status_idx
on public.student_profiles(
    profile_status
);


drop trigger if exists
student_profiles_set_updated_at
on public.student_profiles;

create trigger
student_profiles_set_updated_at
before update
on public.student_profiles
for each row
execute function public.set_updated_at();


-- ============================================================
-- 12. AUDIT LOG
--
-- APPEND-ONLY EVENT LOG.
-- Do not put CV body/PDF contents or passwords here.
-- ============================================================

create table if not exists public.audit_logs (

    id bigint
        generated always as identity
        primary key,

    actor_id uuid
        references public.profiles(id),

    actor_role varchar(50),

    action varchar(150)
        not null,

    entity_type varchar(100)
        not null,

    entity_id uuid,

    old_values jsonb,

    new_values jsonb,

    metadata jsonb
        not null default '{}'::jsonb,

    ip_address inet,

    user_agent text,

    request_id uuid,

    created_at timestamptz
        not null default now()
);


create index if not exists
audit_logs_entity_idx
on public.audit_logs(
    entity_type,
    entity_id,
    created_at desc
);


create index if not exists
audit_logs_actor_idx
on public.audit_logs(
    actor_id,
    created_at desc
);


create index if not exists
audit_logs_created_at_idx
on public.audit_logs(
    created_at desc
);


-- ============================================================
-- 13. AUTH USER -> PROFILE TRIGGER
--
-- Important:
-- It creates only the base profile.
-- It does not trust metadata to assign roles.
-- ============================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

    insert into public.profiles (
        id,
        first_name,
        last_name,
        email,
        phone,
        avatar_url,
        account_status
    )
    values (
        new.id,

        nullif(
            trim(
                coalesce(
                    new.raw_user_meta_data
                        ->> 'first_name',
                    ''
                )
            ),
            ''
        ),

        nullif(
            trim(
                coalesce(
                    new.raw_user_meta_data
                        ->> 'last_name',
                    ''
                )
            ),
            ''
        ),

        lower(
            coalesce(
                new.email,
                ''
            )
        ),

        nullif(
            trim(
                coalesce(
                    new.raw_user_meta_data
                        ->> 'phone',
                    ''
                )
            ),
            ''
        ),

        nullif(
            trim(
                coalesce(
                    new.raw_user_meta_data
                        ->> 'avatar_url',
                    ''
                )
            ),
            ''
        ),

        'pending'
    )

    on conflict (
        id
    )
    do update set

        email =
            excluded.email,

        first_name =
            coalesce(
                public.profiles.first_name,
                excluded.first_name
            ),

        last_name =
            coalesce(
                public.profiles.last_name,
                excluded.last_name
            ),

        phone =
            coalesce(
                public.profiles.phone,
                excluded.phone
            ),

        updated_at =
            now();


    return new;

end;
$$;


drop trigger if exists
on_auth_user_created
on auth.users;

create trigger
on_auth_user_created

after insert
on auth.users

for each row

execute function
public.handle_new_auth_user();


-- ============================================================
-- 14. ROLE SEED DATA
-- ============================================================

insert into public.roles (
    name,
    display_name,
    description,
    is_system
)
values

(
    'super_admin',
    'Super Admin',
    'Full system administration access.',
    true
),

(
    'admin',
    'Admin',
    'User approval and placement administration.',
    true
),

(
    'placement_hr',
    'Placement HR',
    'Internal HRAnalyst placement operations.',
    true
),

(
    'client_hr',
    'Client HR',
    'External employer HR user.',
    true
),

(
    'student',
    'Student',
    'Approved HRAnalyst placement candidate.',
    true
)

on conflict do nothing;


-- ============================================================
-- 15. FOUNDATION PERMISSIONS
--
-- Feature-specific permissions can be expanded later.
-- ============================================================

insert into public.permissions (
    code,
    name,
    description
)
values

(
    'users.read',
    'Read Users',
    'Read user records.'
),

(
    'users.approve',
    'Approve Users',
    'Approve or reject users.'
),

(
    'companies.read',
    'Read Companies',
    'Read company records.'
),

(
    'companies.manage',
    'Manage Companies',
    'Create or update company records.'
),

(
    'profile.read.own',
    'Read Own Profile',
    'Read own profile.'
),

(
    'profile.update.own',
    'Update Own Profile',
    'Update own permitted profile fields.'
)

on conflict do nothing;


-- ============================================================
-- 16. FOUNDATION ROLE PERMISSIONS
-- ============================================================

insert into public.role_permissions (
    role_id,
    permission_id
)

select
    r.id,
    p.id

from public.roles r

cross join public.permissions p

where r.name =
      'super_admin'

on conflict do nothing;


insert into public.role_permissions (
    role_id,
    permission_id
)

select
    r.id,
    p.id

from public.roles r

join public.permissions p
  on p.code in (
      'users.read',
      'users.approve',
      'companies.read',
      'companies.manage',
      'profile.read.own',
      'profile.update.own'
  )

where r.name =
      'admin'

on conflict do nothing;


insert into public.role_permissions (
    role_id,
    permission_id
)

select
    r.id,
    p.id

from public.roles r

join public.permissions p
  on p.code in (
      'companies.read',
      'profile.read.own',
      'profile.update.own'
  )

where r.name =
      'placement_hr'

on conflict do nothing;


insert into public.role_permissions (
    role_id,
    permission_id
)

select
    r.id,
    p.id

from public.roles r

join public.permissions p
  on p.code in (
      'companies.read',
      'profile.read.own',
      'profile.update.own'
  )

where r.name =
      'client_hr'

on conflict do nothing;


insert into public.role_permissions (
    role_id,
    permission_id
)

select
    r.id,
    p.id

from public.roles r

join public.permissions p
  on p.code in (
      'profile.read.own',
      'profile.update.own'
  )

where r.name =
      'student'

on conflict do nothing;


-- ============================================================
-- 17. ENABLE RLS
--
-- Policies are deliberately minimal here.
-- Complete authenticated RBAC policies are Stage 2.
-- ============================================================

alter table public.profiles
enable row level security;

alter table public.roles
enable row level security;

alter table public.permissions
enable row level security;

alter table public.role_permissions
enable row level security;

alter table public.user_roles
enable row level security;

alter table public.companies
enable row level security;

alter table public.client_hr_profiles
enable row level security;

alter table public.placement_hr_profiles
enable row level security;

alter table public.student_profiles
enable row level security;

alter table public.audit_logs
enable row level security;


-- ============================================================
-- 18. AUTHENTICATED USERS MAY READ ROLE CATALOG
--
-- Role assignment itself remains inaccessible.
-- ============================================================

drop policy if exists
"authenticated_read_roles"
on public.roles;

create policy
"authenticated_read_roles"

on public.roles

for select

to authenticated

using (true);


drop policy if exists
"authenticated_read_permissions"
on public.permissions;

create policy
"authenticated_read_permissions"

on public.permissions

for select

to authenticated

using (true);


-- ============================================================
-- 19. PROFILE SELF READ
--
-- Approval/status mutation will be handled by secure
-- Stage-2 server/RPC logic.
-- ============================================================

drop policy if exists
"profile_self_read"
on public.profiles;

create policy
"profile_self_read"

on public.profiles

for select

to authenticated

using (
    id = auth.uid()
);


-- ============================================================
-- 20. STUDENT SELF READ
-- ============================================================

drop policy if exists
"student_profile_self_read"
on public.student_profiles;

create policy
"student_profile_self_read"

on public.student_profiles

for select

to authenticated

using (
    user_id = auth.uid()
);


-- ============================================================
-- 21. CLIENT HR SELF READ
-- ============================================================

drop policy if exists
"client_hr_self_read"
on public.client_hr_profiles;

create policy
"client_hr_self_read"

on public.client_hr_profiles

for select

to authenticated

using (
    user_id = auth.uid()
);


-- ============================================================
-- 22. PLACEMENT HR SELF READ
-- ============================================================

drop policy if exists
"placement_hr_self_read"
on public.placement_hr_profiles;

create policy
"placement_hr_self_read"

on public.placement_hr_profiles

for select

to authenticated

using (
    user_id = auth.uid()
);


-- ============================================================
-- 23. STORAGE BUCKETS
--
-- Buckets are created now so names remain stable.
-- Sensitive object policies arrive with the features that use
-- them.
-- ============================================================

insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit
)
values

(
    'student-cvs',
    'student-cvs',
    false,
    10485760
),

(
    'offer-letters',
    'offer-letters',
    false,
    10485760
),

(
    'system-exports',
    'system-exports',
    false,
    52428800
),

(
    'company-logos',
    'company-logos',
    false,
    5242880
),

(
    'profile-images',
    'profile-images',
    false,
    5242880
),

(
    'job-assets',
    'job-assets',
    false,
    10485760
)

on conflict (id)
do update set
    public =
        excluded.public,

    file_size_limit =
        excluded.file_size_limit;


-- ============================================================
-- 24. FOUNDATION SCHEMA VERSION
-- ============================================================

create table if not exists
public.system_schema_versions (

    version varchar(50)
        primary key,

    description text
        not null,

    applied_at timestamptz
        not null default now()
);


insert into public.system_schema_versions (
    version,
    description
)
values (
    '1.0',
    'HRAnalyst Placement Wing foundational schema'
)
on conflict (
    version
)
do nothing;


commit;