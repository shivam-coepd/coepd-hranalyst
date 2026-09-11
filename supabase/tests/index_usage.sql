select
    schemaname,
    relname as table_name,
    indexrelname as index_name,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch

from pg_stat_user_indexes

where schemaname =
      'public'

order by
    idx_scan desc,
    table_name,
    index_name;


select
    relname as table_name,

    seq_scan,

    seq_tup_read,

    idx_scan,

    idx_tup_fetch

from pg_stat_user_tables

where schemaname =
      'public'

order by
    seq_tup_read desc;