begin;
select set_config('request.jwt.claim.role','service_role',true);

insert into public.notification_outbox(
  id,event_type,channel,recipient_email,dedupe_key,max_attempts,scheduled_for
) values
('a1000000-0000-0000-0000-000000000001','TEST','email','one@example.test','test:claim:one',2,now()),
('a1000000-0000-0000-0000-000000000002','TEST','email','two@example.test','test:claim:two',1,now());

do $$
declare first_id uuid; second_id uuid; first_attempt int;
begin
  select id,attempts into first_id,first_attempt
  from public.claim_notification_outbox(1);

  select id into second_id from public.claim_notification_outbox(1);

  if first_id is null or second_id is null or first_id=second_id then
    raise exception 'Claims were empty or overlapping';
  end if;
  if first_attempt <> 1 then
    raise exception 'Claim did not increment attempts';
  end if;
  if public.finish_notification_attempt(first_id,99,null) then
    raise exception 'Stale acknowledgement was accepted';
  end if;
  if not public.finish_notification_attempt(first_id,first_attempt,'temporary failure') then
    raise exception 'Current failed attempt was not recorded';
  end if;
  if (select status from public.notification_outbox where id=first_id) <> 'pending' then
    raise exception 'Retryable notification did not return to pending';
  end if;
  if not public.finish_notification_attempt(second_id,1,'permanent failure') then
    raise exception 'Terminal failed attempt was not recorded';
  end if;
  if (select status from public.notification_outbox where id=second_id) <> 'dead_letter' then
    raise exception 'Exhausted notification did not enter dead_letter';
  end if;
end;
$$;

do $$
begin
  begin
    insert into public.notification_outbox(event_type,channel,recipient_email,dedupe_key)
    values('TEST','email','duplicate@example.test','test:claim:one');
    raise exception 'Duplicate outbox key was accepted';
  exception when unique_violation then null;
  end;
end;
$$;

rollback;
