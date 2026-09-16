-- ============================================================
-- HRANALYST PLACEMENT WING - MISSING COLUMN PATCH
-- Adds the candidate_count column to the submissions table
-- ============================================================

ALTER TABLE public.submissions 
  ADD COLUMN IF NOT EXISTS candidate_count integer NOT NULL DEFAULT 0;

-- Reload schema cache to ensure API recognizes the new column
NOTIFY pgrst, 'reload schema';
