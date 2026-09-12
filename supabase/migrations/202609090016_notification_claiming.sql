begin;

-- Claim under row locks; concurrent workers receive disjoint rows. Attempts
-- count claims, including workers that crash before recording a result.
create or replace function public.claim_notification_outbox(p_limit integer default 50)
returns setof public.notification_outbox
language plpgsql security definer set search_path = public
as $$
begin
  if coalesce(auth.role(),'') <> 'service_role' then raise exception 'Service role required'; end if;
  return query
  with batch as (
    select id from public.notification_outbox
    where status in ('pending','failed') and attempts < max_attempts and scheduled_for <= now()
    order by scheduled_for,id
    for update skip locked limit greatest(1,least(coalesce(p_limit,50),200))
  )
  update public.notification_outbox o
    set status='processing',attempts=o.attempts+1,processing_started_at=now(),updated_at=now()
    from batch where o.id=batch.id returning o.*;
end;
$$;
revoke all on function public.claim_notification_outbox(integer) from public,anon,authenticated;
grant execute on function public.claim_notification_outbox(integer) to service_role;

-- Fence acknowledgements with the claimed attempt so a stale worker cannot
-- acknowledge a newer delivery attempt after its lease has been recovered.
create or replace function public.finish_notification_attempt(p_outbox_id uuid,p_attempt integer,p_error text default null)
returns boolean language plpgsql security definer set search_path=public
as $$
declare affected integer;
begin
  if coalesce(auth.role(),'') <> 'service_role' then raise exception 'Service role required'; end if;
  update public.notification_outbox set
    status=case when p_error is null then 'sent' when attempts>=max_attempts then 'dead_letter' else 'pending' end,
    sent_at=case when p_error is null then now() else sent_at end,
    failed_at=case when p_error is not null then now() else failed_at end,
    scheduled_for=case when p_error is not null then now()+interval '30 seconds'*least(power(2,attempts-1),120) else scheduled_for end,
    processing_started_at=null,error_message=left(p_error,5000),updated_at=now()
    where id=p_outbox_id and status='processing' and attempts=p_attempt;
  get diagnostics affected=row_count;
  return affected=1;
end;
$$;
revoke all on function public.finish_notification_attempt(uuid,integer,text) from public,anon,authenticated;
grant execute on function public.finish_notification_attempt(uuid,integer,text) to service_role;

insert into public.system_schema_versions(version,description) values('16.0','Recovery: atomic notification claims and fenced acknowledgements')
on conflict(version) do update set description=excluded.description;
commit;
