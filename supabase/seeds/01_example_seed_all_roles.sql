-- ============================================================
-- HRANALYST PLACEMENT WING - SEED DATA EXAMPLES
-- Self-contained: adds missing columns first, then seeds data.
-- Safe to run multiple times (all statements are idempotent).
-- ============================================================
-- Test credentials (all use same password for dev only):
--   superadmin@example.com  / Password@123  -> super_admin
--   admin@example.com       / Password@123  -> admin
--   placementhr@example.com / Password@123  -> placement_hr
--   clienthr@example.com    / Password@123  -> client_hr
--   student@example.com     / Password@123  -> student
-- ============================================================
-- HOW TO USE:
--  1. Go to Supabase Dashboard -> Authentication -> Add User
--     Create each user above. Note the UUID Supabase assigns.
--  2. Paste this entire file into SQL Editor -> Run All.
--     Replace the UUIDs below with those from step 1 if needed.
-- ============================================================

-- Fixed UUIDs (must match auth.users.id after you create them)
-- superadmin  : a0000001-0000-0000-0000-000000000001
-- admin       : a0000002-0000-0000-0000-000000000002
-- placement_hr: a0000003-0000-0000-0000-000000000003
-- client_hr   : a0000004-0000-0000-0000-000000000004
-- student     : a0000005-0000-0000-0000-000000000005
-- company     : c0000001-0000-0000-0000-000000000001

-- ============================================================
-- PART 0: ENSURE ALL REQUIRED COLUMNS EXIST
-- Adds columns missing from older provisioned databases.
-- ============================================================

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS first_name             varchar(120),
  ADD COLUMN IF NOT EXISTS last_name              varchar(120),
  ADD COLUMN IF NOT EXISTS phone                  varchar(30),
  ADD COLUMN IF NOT EXISTS headline               varchar(255),
  ADD COLUMN IF NOT EXISTS summary                text,
  ADD COLUMN IF NOT EXISTS location               varchar(255),
  ADD COLUMN IF NOT EXISTS city                   varchar(150),
  ADD COLUMN IF NOT EXISTS state                  varchar(150),
  ADD COLUMN IF NOT EXISTS country                varchar(150),
  ADD COLUMN IF NOT EXISTS postal_code            varchar(30),
  ADD COLUMN IF NOT EXISTS qualification          varchar(255),
  ADD COLUMN IF NOT EXISTS graduation_year        integer,
  ADD COLUMN IF NOT EXISTS specialization         varchar(255),
  ADD COLUMN IF NOT EXISTS current_company        varchar(255),
  ADD COLUMN IF NOT EXISTS current_designation    varchar(255),
  ADD COLUMN IF NOT EXISTS current_ctc            numeric(14,2),
  ADD COLUMN IF NOT EXISTS current_ctc_currency   varchar(10) DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS notice_period_days     integer,
  ADD COLUMN IF NOT EXISTS preferred_role         varchar(100),
  ADD COLUMN IF NOT EXISTS preferred_location     varchar(255),
  ADD COLUMN IF NOT EXISTS willing_to_relocate    boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS linkedin_url           text,
  ADD COLUMN IF NOT EXISTS github_url             text,
  ADD COLUMN IF NOT EXISTS portfolio_url          text,
  ADD COLUMN IF NOT EXISTS profile_completion     integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profile_status         varchar(30) NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS availability_status    varchar(30) NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS skills                 jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS verification_source    varchar(100),
  ADD COLUMN IF NOT EXISTS verification_reference text,
  ADD COLUMN IF NOT EXISTS verification_at        timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by            uuid,
  ADD COLUMN IF NOT EXISTS verification_reason    text;

-- companies column renames (if legacy names exist)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='companies' AND column_name='company_name')
  AND NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='companies' AND column_name='name') THEN
    ALTER TABLE public.companies RENAME COLUMN company_name TO name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='companies' AND column_name='logo_url')
  AND NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='companies' AND column_name='logo') THEN
    ALTER TABLE public.companies RENAME COLUMN logo_url TO logo;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='companies' AND column_name='website_url')
  AND NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='companies' AND column_name='website') THEN
    ALTER TABLE public.companies RENAME COLUMN website_url TO website;
  END IF;
END $$;

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS legal_name          varchar(255),
  ADD COLUMN IF NOT EXISTS domain              varchar(255),
  ADD COLUMN IF NOT EXISTS website             text,
  ADD COLUMN IF NOT EXISTS industry            varchar(150),
  ADD COLUMN IF NOT EXISTS size                varchar(100),
  ADD COLUMN IF NOT EXISTS logo                text,
  ADD COLUMN IF NOT EXISTS primary_email       varchar(320),
  ADD COLUMN IF NOT EXISTS primary_phone       varchar(30),
  ADD COLUMN IF NOT EXISTS verification_method varchar(50),
  ADD COLUMN IF NOT EXISTS verification_notes  text,
  ADD COLUMN IF NOT EXISTS verified_at         timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by         uuid,
  ADD COLUMN IF NOT EXISTS created_by          uuid,
  ADD COLUMN IF NOT EXISTS deleted_at          timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason    text;


-- ============================================================
-- STEP 1: Approve and name each profile
-- The on_auth_user_created trigger creates the row automatically
-- when the auth user is added. We just update names + status.
-- ============================================================

UPDATE public.profiles SET
  first_name     = 'Super',
  last_name      = 'Admin',
  account_status = 'approved',
  approved_at    = now()
WHERE id = 'a0000001-0000-0000-0000-000000000001';

UPDATE public.profiles SET
  first_name     = 'Platform',
  last_name      = 'Admin',
  account_status = 'approved',
  approved_at    = now()
WHERE id = 'a0000002-0000-0000-0000-000000000002';

UPDATE public.profiles SET
  first_name     = 'Priya',
  last_name      = 'Sharma',
  account_status = 'approved',
  approved_at    = now()
WHERE id = 'a0000003-0000-0000-0000-000000000003';

UPDATE public.profiles SET
  first_name     = 'Rahul',
  last_name      = 'Mehra',
  account_status = 'approved',
  approved_at    = now()
WHERE id = 'a0000004-0000-0000-0000-000000000004';

UPDATE public.profiles SET
  first_name     = 'Anil',
  last_name      = 'Kumar',
  account_status = 'approved',
  approved_at    = now()
WHERE id = 'a0000005-0000-0000-0000-000000000005';


-- ============================================================
-- STEP 2: Assign roles
-- ============================================================

INSERT INTO public.user_roles (user_id, role_id)
SELECT 'a0000001-0000-0000-0000-000000000001', id FROM public.roles WHERE name = 'super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id)
SELECT 'a0000002-0000-0000-0000-000000000002', id FROM public.roles WHERE name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id)
SELECT 'a0000003-0000-0000-0000-000000000003', id FROM public.roles WHERE name = 'placement_hr'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id)
SELECT 'a0000004-0000-0000-0000-000000000004', id FROM public.roles WHERE name = 'client_hr'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id)
SELECT 'a0000005-0000-0000-0000-000000000005', id FROM public.roles WHERE name = 'student'
ON CONFLICT (user_id, role_id) DO NOTHING;


-- ============================================================
-- STEP 3: Create company
-- verification_status = 'verified' is required for:
--   - appearing in "Select Company" dropdown for Client HR
--   - allowing jobs to be posted against this company
-- ============================================================

INSERT INTO public.companies (
  id,
  name,
  legal_name,
  domain,
  website,
  industry,
  size,
  primary_email,
  primary_phone,
  verification_status,
  verification_method,
  verification_notes,
  is_active,
  verified_at,
  verified_by,
  created_by
) VALUES (
  'c0000001-0000-0000-0000-000000000001',
  'Acme Technologies Pvt Ltd',
  'Acme Technologies Private Limited',
  'acme.example.com',
  'https://acme.example.com',
  'Information Technology',
  '51-200',
  'hr@acme.example.com',
  '+91-9876543210',
  'verified',
  'manual',
  'Verified via company registration document',
  true,
  now(),
  'a0000001-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- STEP 4: Create Client HR profile (links user to company)
-- The company must already exist (Step 3).
-- This is what allows company name to appear in the dropdown.
-- ============================================================

INSERT INTO public.client_hr_profiles (
  user_id,
  company_id,
  designation,
  department,
  work_email,
  work_phone,
  is_primary_contact,
  is_active
) VALUES (
  'a0000004-0000-0000-0000-000000000004',
  'c0000001-0000-0000-0000-000000000001',
  'Senior HR Manager',
  'Human Resources',
  'rahul.mehra@acme.example.com',
  '+91-9000000004',
  true,
  true
) ON CONFLICT (user_id) DO NOTHING;


-- ============================================================
-- STEP 5: Create Student profile
-- KEY RULES FOR STUDENTS:
--   enrollment_id   -> UNIQUE (case-insensitive), NOT NULL
--   Format:            COEPD-YYYY-NNNN  (HRAnalyst convention)
--   verification_status = 'verified'  -> can apply to jobs
--   account_status (profiles) = 'approved' -> can log in
-- ============================================================

INSERT INTO public.student_profiles (
  id,
  user_id,
  enrollment_id,
  verification_status,
  first_name,
  last_name,
  phone,
  headline,
  qualification,
  specialization,
  graduation_year,
  total_experience_months,
  current_company,
  current_designation,
  current_ctc,
  current_ctc_currency,
  notice_period_days,
  city,
  state,
  country,
  preferred_role,
  willing_to_relocate,
  profile_status,
  profile_completion,
  availability_status
) VALUES (
  's0000001-0000-0000-0000-000000000001',
  'a0000005-0000-0000-0000-000000000005',
  'COEPD-2024-0001',         -- UNIQUE per student; case-insensitive
  'verified',                -- required to apply to jobs
  'Anil',
  'Kumar',
  '+91-9000000005',
  'Business Analyst | CBAP Certified | 3+ Years',
  'MBA',                     -- degree / qualification
  'Business Analytics',      -- specialization / major
  2021,                      -- graduation_year (1950-2100)
  36,                        -- experience in months (3 years)
  'TCS Ltd',
  'Junior Business Analyst',
  600000.00,                 -- current CTC in INR
  'INR',
  30,                        -- notice period in days
  'Hyderabad',
  'Telangana',
  'India',
  'Business Analyst',
  true,
  'active',
  85,                        -- profile_completion percentage (0-100)
  'available'
) ON CONFLICT (user_id) DO NOTHING;


-- ============================================================
-- STEP 6: Verify - check what was created
-- ============================================================

SELECT
  p.email,
  p.first_name || ' ' || p.last_name AS full_name,
  p.account_status,
  string_agg(r.name, ', ' ORDER BY r.name) AS roles
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
LEFT JOIN public.roles r ON r.id = ur.role_id
WHERE p.id IN (
  'a0000001-0000-0000-0000-000000000001',
  'a0000002-0000-0000-0000-000000000002',
  'a0000003-0000-0000-0000-000000000003',
  'a0000004-0000-0000-0000-000000000004',
  'a0000005-0000-0000-0000-000000000005'
)
GROUP BY p.id, p.email, p.first_name, p.last_name, p.account_status
ORDER BY p.email;

SELECT id, name, verification_status, is_active, domain
FROM public.companies
WHERE id = 'c0000001-0000-0000-0000-000000000001';

SELECT
  p.email,
  c.name AS company_name,
  ch.designation,
  ch.is_primary_contact
FROM public.client_hr_profiles ch
JOIN public.profiles  p ON p.id = ch.user_id
JOIN public.companies c ON c.id = ch.company_id
WHERE ch.user_id = 'a0000004-0000-0000-0000-000000000004';

SELECT
  sp.enrollment_id,
  sp.first_name || ' ' || sp.last_name AS full_name,
  sp.verification_status,
  sp.qualification,
  sp.graduation_year,
  sp.total_experience_months
FROM public.student_profiles sp
WHERE sp.user_id = 'a0000005-0000-0000-0000-000000000005';
