
DELETE FROM public.interview_status_history WHERE interview_id = '9e12faab-4ccb-4b62-901a-201a9f9c3990';
DELETE FROM public.interview_participants WHERE interview_id = '9e12faab-4ccb-4b62-901a-201a9f9c3990';
DELETE FROM public.interviews WHERE id = '9e12faab-4ccb-4b62-901a-201a9f9c3990';
DELETE FROM public.notification_outbox WHERE entity_id = '9e12faab-4ccb-4b62-901a-201a9f9c3990';
UPDATE public.applications SET status = 'mock_completed' WHERE id = '035e9296-1c38-427e-9d0c-521adba7beec';
DELETE FROM public.application_status_history WHERE application_id = '035e9296-1c38-427e-9d0c-521adba7beec' AND new_status = 'interview_scheduled';
