begin;

do $$
begin
  if exists (
    select 1 from public.application_state_transitions
    where from_status='offer_received' and to_status='placed'
  ) then
    raise exception 'Direct offer_received to placed transition must be blocked';
  end if;

  if not exists (
    select 1 from public.application_state_transitions
    where from_status='offer_received' and to_status='offer_accepted'
  ) or not exists (
    select 1 from public.application_state_transitions
    where from_status='offer_accepted' and to_status='placed'
  ) then
    raise exception 'Accepted-offer placement path is incomplete';
  end if;
end;
$$;

create temporary table transition_probe(status varchar(50) not null);
create trigger transition_probe_guard
before update of status on transition_probe
for each row execute function public.enforce_application_state_transition();

insert into transition_probe(status) values ('offer_received');
update transition_probe set status='offer_accepted';
update transition_probe set status='placed';

do $$
begin
  update transition_probe set status='offer_received';
  raise exception 'Invalid placed to offer_received transition was accepted';
exception
  when raise_exception then
    if sqlerrm not like 'Invalid application state transition:%' then
      raise;
    end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='jobs'
  ) then
    raise exception 'Jobs RLS policies are missing';
  end if;

  if has_table_privilege('anon','public.audit_logs','SELECT') then
    raise exception 'Anon can read audit logs';
  end if;

  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='create_platform_user'
      and has_function_privilege('authenticated',p.oid,'EXECUTE')
  ) then
    raise exception 'Authenticated users can execute privileged user provisioning RPC';
  end if;
end;
$$;

rollback;
