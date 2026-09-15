-- ============================================================
-- MIGRATION 019: SCHEMA ALIGNMENT PATCH
-- Idempotently renames legacy company column names to canonical
-- names and adds all columns from the canonical Stage 1+
-- migrations that may be missing from databases provisioned
-- from older schema versions.
-- Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT).
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Rename legacy companies columns -> canonical names
-- ------------------------------------------------------------
do $$ begin
  if exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='companies' and column_name='company_name')
  and not exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='companies' and column_name='name') then
    alter table public.companies rename column company_name to name;
    raise notice 'Renamed companies.company_name -> companies.name';
  end if;

  if exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='companies' and column_name='company_domain')
  and not exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='companies' and column_name='domain') then
    alter table public.companies rename column company_domain to domain;
    raise notice 'Renamed companies.company_domain -> companies.domain';
  end if;

  if exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='companies' and column_name='website_url')
  and not exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='companies' and column_name='website') then
    alter table public.companies rename column website_url to website;
    raise notice 'Renamed companies.website_url -> companies.website';
  end if;

  if exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='companies' and column_name='company_size')
  and not exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='companies' and column_name='size') then
    alter table public.companies rename column company_size to size;
    raise notice 'Renamed companies.company_size -> companies.size';
  end if;

  if exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='companies' and column_name='logo_url')
  and not exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='companies' and column_name='logo') then
    alter table public.companies rename column logo_url to logo;
    raise notice 'Renamed companies.logo_url -> companies.logo';
  end if;
end $$;

-- ------------------------------------------------------------
-- 2. Add missing companies columns
-- ------------------------------------------------------------
alter table public.companies
  add column if not exists legal_name          varchar(255),
  add column if not exists code                varchar(100),
  add column if not exists domain              varchar(255),
  add column if not exists website             text,
  add column if not exists industry            varchar(150),
  add column if not exists size                varchar(100),
  add column if not exists logo                text,
  add column if not exists registration_number varchar(150),
  add column if not exists gst_number          varchar(50),
  add column if not exists linkedin_url        text,
  add column if not exists primary_email       varchar(320),
  add column if not exists primary_phone       varchar(30),
  add column if not exists address             text,
  add column if not exists address_line_1      text,
  add column if not exists address_line_2      text,
  add column if not exists city                varchar(150),
  add column if not exists state               varchar(150),
  add column if not exists country             varchar(150),
  add column if not exists postal_code         varchar(30),
  add column if not exists notes               text,
  add column if not exists rejection_reason    text,
  add column if not exists verification_method varchar(50),
  add column if not exists verification_notes  text,
  add column if not exists verified_at         timestamptz,
  add column if not exists verified_by         uuid references public.profiles(id),
  add column if not exists deleted_at          timestamptz,
  add column if not exists deleted_by          uuid references public.profiles(id),
  add column if not exists created_by          uuid references public.profiles(id);

-- ------------------------------------------------------------
-- 3. Add missing student_profiles columns
--    The live DB may only have the bare minimum columns.
-- ------------------------------------------------------------
alter table public.student_profiles
  add column if not exists verification_source      varchar(100),
  add column if not exists verification_reference   text,
  add column if not exists verification_at          timestamptz,
  add column if not exists verified_by              uuid references public.profiles(id),
  add column if not exists verification_reason      text,
  add column if not exists first_name               varchar(120),
  add column if not exists last_name                varchar(120),
  add column if not exists phone                    varchar(30),
  add column if not exists headline                 varchar(255),
  add column if not exists summary                  text,
  add column if not exists location                 varchar(255),
  add column if not exists city                     varchar(150),
  add column if not exists state                    varchar(150),
  add column if not exists country                  varchar(150),
  add column if not exists postal_code              varchar(30),
  add column if not exists qualification            varchar(255),
  add column if not exists graduation_year          integer,
  add column if not exists specialization           varchar(255),
  add column if not exists current_company          varchar(255),
  add column if not exists current_designation      varchar(255),
  add column if not exists current_ctc              numeric(14,2),
  add column if not exists current_ctc_currency     varchar(10) default 'INR',
  add column if not exists notice_period_days       integer,
  add column if not exists preferred_role           varchar(100),
  add column if not exists preferred_location       varchar(255),
  add column if not exists willing_to_relocate      boolean default false,
  add column if not exists linkedin_url             text,
  add column if not exists github_url               text,
  add column if not exists portfolio_url            text,
  add column if not exists profile_completion       integer not null default 0,
  add column if not exists profile_status           varchar(30) not null default 'active',
  add column if not exists skills                   jsonb not null default '[]',
  add column if not exists preferred_workplace_type varchar(30),
  add column if not exists availability_status      varchar(30) not null default 'available';

-- Check constraints (wrapped to be idempotent)
do $$ begin
  alter table public.student_profiles add constraint student_profiles_graduation_year_check
    check (graduation_year is null or graduation_year between 1950 and 2100);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.student_profiles add constraint student_profiles_notice_period_check
    check (notice_period_days is null or notice_period_days >= 0);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.student_profiles add constraint student_profiles_experience_check
    check (total_experience_months >= 0);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.student_profiles add constraint student_profiles_preferred_workplace_type_check
    check (preferred_workplace_type is null
           or preferred_workplace_type in ('onsite','remote','hybrid'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.student_profiles add constraint student_profiles_availability_status_check
    check (availability_status in ('available','interviewing','not_available'));
exception when duplicate_object then null; end $$;

-- Enrollment ID unique index
create unique index if not exists student_profiles_enrollment_id_uidx
  on public.student_profiles(lower(enrollment_id));

-- ------------------------------------------------------------
-- 4. Add missing applications columns (Stages 5-7)
-- ------------------------------------------------------------
alter table public.applications
  add column if not exists scoring_error           text,
  add column if not exists verified_match_score    numeric(5,2),
  add column if not exists verified_ats_score      numeric(5,2),
  add column if not exists verification_notes      text,
  add column if not exists update_request          text,
  add column if not exists verified_by             uuid references public.profiles(id),
  add column if not exists offer_accepted_at       timestamptz,
  add column if not exists selected_for_offer_at   timestamptz,
  add column if not exists submitted_at            timestamptz,
  add column if not exists shortlisted_at          timestamptz,
  add column if not exists selected_at             timestamptz,
  add column if not exists offer_received_at       timestamptz,
  add column if not exists placed_at               timestamptz,
  add column if not exists withdrawn_at            timestamptz,
  add column if not exists withdrawal_reason       text,
  add column if not exists rejection_reason        text,
  add column if not exists verification_pending_at timestamptz,
  add column if not exists verification_due_at     timestamptz;

-- ------------------------------------------------------------
-- 5. Add missing student_cvs columns (Stage 5)
-- ------------------------------------------------------------
alter table public.student_cvs
  add column if not exists parsed_at   timestamptz,
  add column if not exists parse_error text;

-- ------------------------------------------------------------
-- 6. Refresh domain unique index after possible rename
-- ------------------------------------------------------------
do $$ begin
  if exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='companies' and column_name='domain') then
    execute $ddl$
      create unique index if not exists companies_domain_uidx
      on public.companies(lower(domain))
      where domain is not null and deleted_at is null
    $ddl$;
  end if;
end $$;

insert into public.system_schema_versions(version, description)
values ('19.0', 'Legacy deployment schema alignment')
on conflict (version) do update
set description = excluded.description, applied_at = now();

commit;
