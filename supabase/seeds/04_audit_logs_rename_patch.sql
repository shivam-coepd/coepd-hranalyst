-- ============================================================
-- HRANALYST PLACEMENT WING - AUDIT LOGS COLUMN RENAME
-- Renames legacy columns to match the application types
-- ============================================================

ALTER TABLE public.audit_logs 
  RENAME COLUMN old_data TO old_values;

ALTER TABLE public.audit_logs 
  RENAME COLUMN new_data TO new_values;

-- Reload schema cache to ensure API recognizes the renamed columns
NOTIFY pgrst, 'reload schema';
