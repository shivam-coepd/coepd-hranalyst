# Storage and File Security

`student-cvs` and `offer-letters` are private Supabase Storage buckets. SQL integrity tests fail if either becomes public.

Students request a scoped signed upload URL for PDF or DOCX CVs. Server validation enforces extension, MIME type, positive size, and the 10 MiB database limit. CV metadata belongs to one `student_profiles` row. A CV referenced by an application cannot be destructively removed, and one non-deleted primary CV is enforced per Student.

Downloads use server routes. Student CV URLs last 60 seconds; Client-submission CV URLs and offer URLs last 300 seconds. Before signing, services derive the authenticated Student, linked Client company, assigned job, or Admin authority and verify the target record. Permanent public URLs are neither stored nor returned.

Browser roles cannot mutate public metadata tables directly after migration 18. Storage-object policies still constrain bucket/path access, while the server owns metadata completion, historical links, and audit events.

Regression evidence includes `production_integrity.sql`, `stage01_security.sql`, `stage18_privilege_hardening.sql`, anonymous protected-API Playwright tests, and the signed-access services under `src/services/cv`, `src/services/submissions`, and `src/services/offers`.
