import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getNextInterviewRound(applicationId: string) {
  const { data, error } = await supabaseAdmin
    .from("interviews")
    .select("round_number")
    .eq("application_id", applicationId)
    .order("round_number", {
      ascending: false,
    })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return 1;
  }

  return data[0].round_number + 1;
}
