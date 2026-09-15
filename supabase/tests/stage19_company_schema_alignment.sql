begin;

do $$
declare
  required_column text;
begin
  foreach required_column in array array[
    'name','legal_name','domain','website','industry','size','logo',
    'registration_number','gst_number','linkedin_url','primary_email',
    'primary_phone','address','city','state','country','postal_code'
  ]
  loop
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'companies'
        and column_name = required_column
    ) then
      raise exception 'Missing companies.%', required_column;
    end if;
  end loop;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'companies'
      and column_name in ('company_name','company_domain','website_url','company_size','logo_url')
  ) then
    raise exception 'Legacy company column family still exists';
  end if;
end;
$$;

insert into public.companies(
  name, legal_name, domain, website, industry, size, primary_email,
  primary_phone, registration_number, gst_number, linkedin_url,
  address, city, state, country, postal_code, verification_status, is_active
)
values (
  'APT Digital Express', 'APT IT Solutions', 'aptdigital.in',
  'https://aptdigital.in/', 'IT', '10-50', 'company@example.test',
  '9225336339', 'U72200MH2026PTC123456', '29AAAGM0289C1ZF',
  'https://www.linkedin.com/company/example', 'Example address',
  'Kothrud', 'Maharashtra', 'India', '635241', 'pending', true
);

do $$
begin
  if not exists (select 1 from public.system_schema_versions where version = '19.0') then
    raise exception 'Schema version 19.0 missing';
  end if;
end;
$$;

rollback;
