import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getPerformanceStudentFeed({
  cursor,
  limit,
}: {
  cursor?: string | null;
  limit: number;
}) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  let query = supabaseAdmin
    .from("jobs")
    .select(
      `
        id,
        job_code,
        job_title,
        role_type,
        location_type,
        location,
        workplace_type,
        experience_min_years,
        experience_max_years,
        salary_min,
        salary_max,
        salary_currency,
        published_at,

        companies!inner (
          id,
          name,
          logo
        )
      `,
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", {
      ascending: false,
    })
    .order("id", {
      ascending: false,
    })
    .limit(safeLimit + 1);

  if (cursor) {
    const [publishedAt, id] = cursor.split("|");

    if (publishedAt && id) {
      query = query.or(
        `published_at.lt.${publishedAt},and(published_at.eq.${publishedAt},id.lt.${id})`,
      );
    }
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];

  const hasMore = rows.length > safeLimit;

  const items = rows.slice(0, safeLimit);

  const last = items[items.length - 1];

  const nextCursor = hasMore && last ? `${last.published_at}|${last.id}` : null;

  return {
    items,
    nextCursor,
  };
}
