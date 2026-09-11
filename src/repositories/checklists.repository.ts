import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getChecklistForJob(jobId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_checklists")
    .select("*")
    .eq("job_id", jobId)
    .in("status", ["draft", "approved"])
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getChecklistHistory(jobId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_checklists")
    .select("id,version,status,source,approved_at,generated_at,created_at")
    .eq("job_id", jobId)
    .order("version", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
