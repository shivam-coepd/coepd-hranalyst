-- ============================================================
-- HRANALYST PLACEMENT WING - MISSING COLUMN PATCH
-- Adds the missing actor_id column to audit_logs
-- ============================================================

ALTER TABLE public.audit_logs 
  ADD COLUMN IF NOT EXISTS actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS actor_role varchar(255),
  ADD COLUMN IF NOT EXISTS request_id uuid;

-- Reload schema cache to ensure API recognizes the new columns
NOTIFY pgrst, 'reload schema';
