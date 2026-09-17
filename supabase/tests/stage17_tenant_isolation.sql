begin;

insert into auth.users(id,email) values
('b1000000-0000-0000-0000-000000000001','ph1@example.test'),
('b1000000-0000-0000-0000-000000000002','ph2@example.test'),
('b1000000-0000-0000-0000-000000000003','client1@one.test'),
('b1000000-0000-0000-0000-000000000004','client2@two.test');
update public.profiles set account_status='approved' where id::text like 'b1000000-%';

insert into public.user_roles(user_id,role_id)
select v.user_id,r.id from (values
 ('b1000000-0000-0000-0000-000000000001'::uuid,'placement_hr'),
 ('b1000000-0000-0000-0000-000000000002'::uuid,'placement_hr'),
 ('b1000000-0000-0000-0000-000000000003'::uuid,'client_hr'),
 ('b1000000-0000-0000-0000-000000000004'::uuid,'client_hr')
) v(user_id,role_name) join public.roles r on r.name=v.role_name;

insert into public.companies(id,name,domain,verification_status,is_active,created_by) values
('b2000000-0000-0000-0000-000000000001','Tenant One','one.test','verified',true,'b1000000-0000-0000-0000-000000000001'),
('b2000000-0000-0000-0000-000000000002','Tenant Two','two.test','verified',true,'b1000000-0000-0000-0000-000000000002');
insert into public.client_hr_profiles(user_id,company_id,is_active) values
('b1000000-0000-0000-0000-000000000003','b2000000-0000-0000-0000-000000000001',true),
('b1000000-0000-0000-0000-000000000004','b2000000-0000-0000-0000-000000000002',true);

insert into public.jobs(id,company_id,created_by,assigned_placement_hr,job_title,role_type,jd_text,status) values
('b3000000-0000-0000-0000-000000000001','b2000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','Tenant One BA','BA',repeat('A',60),'draft'),
('b3000000-0000-0000-0000-000000000002','b2000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000002','Tenant Two BA','BA',repeat('B',60),'draft');

-- Direct table access is normally withheld in favor of server services. Grant
-- SELECT only inside this rolled-back transaction to exercise the RLS policy.
grant select on public.jobs to authenticated;
set local role authenticated;

select set_config('request.jwt.claim.sub','b1000000-0000-0000-0000-000000000001',true);
do $$ begin
 if (select count(*) from public.jobs)<>1 or (select company_id from public.jobs limit 1)<>'b2000000-0000-0000-0000-000000000001'::uuid then
  raise exception 'Unassigned Placement HR job access was not denied';
 end if;
end $$;

select set_config('request.jwt.claim.sub','b1000000-0000-0000-0000-000000000003',true);
do $$ begin
 if (select count(*) from public.jobs)<>1 or (select company_id from public.jobs limit 1)<>'b2000000-0000-0000-0000-000000000001'::uuid then
  raise exception 'Cross-company Client HR job access was not denied';
 end if;
end $$;

rollback;
