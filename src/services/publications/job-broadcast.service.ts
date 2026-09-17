import type { Database } from "@/types/database";
import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
export interface BroadcastOptions {
  email: boolean;
  whatsapp: boolean;
  telegram: boolean;
}
export async function queueJobPublishedBroadcast(args: {
  publicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  actorUserId: string;
  options: BroadcastOptions;
}) {
  const { data: studentRole } = await supabaseAdmin
    .from("roles")
    .select("id")
    .eq("name", "student")
    .single();
  if (!studentRole)
    return {
      eligibleStudents: 0,
      queued: 0,
      skippedWhatsapp: 0,
      telegramQueued: false,
    };
  const { data: roleRows, error: roleError } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role_id", studentRole.id);
  if (roleError) throw new Error(roleError.message);
  const ids = (roleRows ?? []).map((r) => r.user_id);
  if (!ids.length)
    return {
      eligibleStudents: 0,
      queued: 0,
      skippedWhatsapp: 0,
      telegramQueued: false,
    };
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select(
      "id,email,phone,account_status,student_profiles!inner(verification_status,profile_status)",
    )
    .in("id", ids)
    .eq("account_status", "approved");
  if (profileError) throw new Error(profileError.message);
  const eligible = (profiles ?? []).filter((p) => {
    const student = Array.isArray(p.student_profiles)
      ? p.student_profiles[0]
      : p.student_profiles;
    return (
      student?.verification_status === "verified" &&
      student?.profile_status === "active"
    );
  });
  const rows: Database["public"]["Tables"]["notification_outbox"]["Insert"][] =
    [];
  let skippedWhatsapp = 0;
  for (const p of eligible) {
    const base = {
      job_id: args.jobId,
      job_title: args.jobTitle,
      company_name: args.companyName,
      publication_id: args.publicationId,
    };
    rows.push({
      event_type: "JOB_PUBLISHED",
      channel: "in_app",
      recipient_user_id: p.id,
      entity_type: "job",
      entity_id: args.jobId,
      payload: base,
      dedupe_key: `job:${args.jobId}:pub:${args.publicationId}:in_app:${p.id}`,
    });
    if (args.options.email && p.email)
      rows.push({
        event_type: "JOB_PUBLISHED",
        channel: "email",
        recipient_user_id: p.id,
        recipient_email: p.email,
        entity_type: "job",
        entity_id: args.jobId,
        payload: base,
        dedupe_key: `job:${args.jobId}:pub:${args.publicationId}:email:${p.id}`,
      });
    if (args.options.whatsapp) {
      if (p.phone)
        rows.push({
          event_type: "JOB_PUBLISHED",
          channel: "whatsapp",
          recipient_user_id: p.id,
          entity_type: "job",
          entity_id: args.jobId,
          payload: { ...base, phone: p.phone },
          dedupe_key: `job:${args.jobId}:pub:${args.publicationId}:whatsapp:${p.id}`,
        });
      else skippedWhatsapp++;
    }
  }
  let telegramQueued = false;
  const telegramChatId = process.env.TELEGRAM_JOB_CHANNEL_ID?.trim();
  if (args.options.telegram && telegramChatId) {
    rows.push({
      event_type: "JOB_PUBLISHED",
      channel: "telegram",
      recipient_user_id: args.actorUserId,
      entity_type: "job",
      entity_id: args.jobId,
      payload: {
        job_id: args.jobId,
        job_title: args.jobTitle,
        company_name: args.companyName,
        publication_id: args.publicationId,
        telegram_chat_id: telegramChatId,
      },
      dedupe_key: `job:${args.jobId}:pub:${args.publicationId}:telegram:channel`,
    });
    telegramQueued = true;
  }
  let queued = 0;
  if (rows.length) {
    const dedupeKeys = rows.map((row) => String(row.dedupe_key));
    const existing = new Set<string>();
    for (let start = 0; start < dedupeKeys.length; start += 200) {
      const { data, error } = await supabaseAdmin
        .from("notification_outbox")
        .select("dedupe_key")
        .in("dedupe_key", dedupeKeys.slice(start, start + 200));
      if (error) throw new Error(error.message);
      for (const item of data ?? [])
        if (item.dedupe_key) existing.add(item.dedupe_key);
    }
    const fresh = rows.filter((row) => !existing.has(String(row.dedupe_key)));
    for (let start = 0; start < fresh.length; start += 200) {
      const { error } = await supabaseAdmin
        .from("notification_outbox")
        .insert(fresh.slice(start, start + 200));
      if (error) throw new Error(error.message);
      queued += fresh.slice(start, start + 200).length;
    }
  }
  const summary = {
    eligibleStudents: eligible.length,
    queued,
    skippedWhatsapp,
    telegramQueued,
    telegramConfigured: Boolean(telegramChatId),
  };
  await supabaseAdmin
    .from("job_publications")
    .update({
      broadcast_summary: summary,
      broadcast_queued_at: new Date().toISOString(),
    })
    .eq("id", args.publicationId);
  return summary;
}
