
SELECT public.schedule_client_interview(
    '8787fbc2-5201-40d3-a2b2-3562197b89d1'::uuid, -- submission_candidate_id
    1,
    'Round 1',
    'technical',
    '2026-09-25T14:00:00Z'::timestamptz,
    45,
    'Asia/Kolkata',
    'online',
    'Google Meet',
    'https://meet.google.com/uti-pbxe-bhy',
    null,
    'instructions'
);
