begin;

-- Supabase's database defaults grant new public-schema objects to API roles.
-- This application exposes data through scoped SELECT policies and audited RPCs,
-- so anonymous access and direct authenticated mutations are denied explicitly.
revoke all privileges on all tables in schema public from anon;
revoke all privileges on all sequences in schema public from anon;
revoke execute on all functions in schema public from public, anon;

revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public from authenticated;
revoke all privileges on all sequences in schema public from authenticated;

-- Views run with their owner privileges on supported PostgreSQL versions. They
-- are consumed by scoped server services and must not be queried by browser roles.
do $$
declare
  relation record;
begin
  for relation in
    select n.nspname as schema_name, c.relname as relation_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('v', 'm')
  loop
    execute format(
      'revoke all privileges on table %I.%I from anon, authenticated',
      relation.schema_name,
      relation.relation_name
    );
  end loop;
end;
$$;

-- Apply the same least-privilege baseline to objects created by later migrations.
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public
  revoke insert, update, delete, truncate, references, trigger on tables from authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon;

insert into public.system_schema_versions(version, description)
values ('18.0', 'Public API role privilege hardening')
on conflict (version) do update
set description = excluded.description, applied_at = now();

commit;
