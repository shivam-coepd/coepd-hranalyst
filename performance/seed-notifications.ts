import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Supabase configuration missing");
}

const supabase = createClient(url, key);

async function main() {
  const count = Number(process.env.PERF_NOTIFICATION_COUNT ?? 5000);

  const rows = Array.from(
    {
      length: count,
    },
    (_, index) => ({
      event_type: "PERF_NOTIFICATION",

      channel: "in_app",

      recipient_email: `perf-${index}@example.invalid`,

      entity_type: "performance",

      payload: {
        message: `Performance notification ${index + 1}`,
      },

      dedupe_key: `PERF:${Date.now()}:${index}`,
    }),
  );

  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase
      .from("notification_outbox")
      .insert(rows.slice(i, i + 500));

    if (error) {
      throw new Error(error.message);
    }
  }

  console.log(`Inserted ${count} performance notifications`);
}

main().catch((error) => {
  console.error(error);

  process.exit(1);
});
