select
    queryid,

    calls,

    round(
        total_exec_time::numeric,
        2
    ) as total_exec_ms,

    round(
        mean_exec_time::numeric,
        2
    ) as mean_exec_ms,

    round(
        max_exec_time::numeric,
        2
    ) as max_exec_ms,

    rows,

    left(
        query,
        500
    ) as query

from pg_stat_statements

where dbid =
      (
          select oid
          from pg_database
          where datname =
                current_database()
      )

order by
    total_exec_time desc

limit 50;