do $$ begin
 if to_regclass('public.mock_availability_slots') is null then raise exception 'mock_availability_slots missing'; end if;
 if to_regclass('public.mock_interviews') is null then raise exception 'mock_interviews missing'; end if;
 if to_regclass('public.mock_scorecards') is null then raise exception 'mock_scorecards missing'; end if;
 if not exists(select 1 from public.system_schema_versions where version='9.0') then raise exception 'schema version 9.0 missing'; end if;
 if to_regprocedure('public.create_mock_slot(uuid,timestamp with time zone,integer,text,text,text)') is null then raise exception 'create_mock_slot missing'; end if;
 if to_regprocedure('public.schedule_mock_interview(uuid,uuid,timestamp with time zone,integer,text,text,text)') is null then raise exception 'schedule_mock_interview missing'; end if;
 if to_regprocedure('public.book_mock_slot(uuid,uuid)') is null then raise exception 'book_mock_slot missing'; end if;
 if to_regprocedure('public.submit_mock_scorecard(uuid,numeric,numeric,numeric,numeric,text,text,text,text,text,text)') is null then raise exception 'submit_mock_scorecard missing'; end if;
 if not exists(select 1 from pg_indexes where schemaname='public' and indexname='mock_interviews_one_active_application_uidx') then raise exception 'active mock uniqueness missing'; end if;
 if not exists(select 1 from pg_indexes where schemaname='public' and indexname='mock_scorecards_one_current_uidx') then raise exception 'current scorecard uniqueness missing'; end if;
 if has_table_privilege('authenticated','public.mock_interviews','INSERT') or has_table_privilege('authenticated','public.mock_interviews','UPDATE') or has_table_privilege('authenticated','public.mock_scorecards','INSERT') or has_table_privilege('authenticated','public.mock_scorecards','UPDATE') then raise exception 'authenticated direct mock mutation privilege must be revoked'; end if;
 raise notice 'STAGE 9 MOCK INTERVIEWS STRUCTURE: PASS';
end $$;
