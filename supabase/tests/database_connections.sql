select
    state,
    count(*) as connections

from pg_stat_activity

where datname =
      current_database()

group by
    state

order by
    connections desc;


select
    count(*) as total_connections,

    (
        select setting::integer
        from pg_settings
        where name =
              'max_connections'
    )
        as max_connections

from pg_stat_activity

where datname =
      current_database();