select
    relname as table_name,
    pg_size_pretty(
        pg_total_relation_size(relid)
    ) as total_size,
    pg_size_pretty(
        pg_relation_size(relid)
    ) as table_size,
    pg_size_pretty(
        pg_indexes_size(relid)
    ) as index_size,
    n_live_tup as estimated_rows
from
    pg_stat_user_tables
where
    schemaname = 'public'
order by
    pg_total_relation_size(relid) desc;