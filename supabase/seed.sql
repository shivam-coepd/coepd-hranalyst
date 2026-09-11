-- ============================================================
-- HRANALYST LOCAL DEVELOPMENT SEED
-- STAGE 1
--
-- No real students, clients, emails or credentials.
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