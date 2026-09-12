import { routeError } from "@/lib/http/route-error";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
export async function POST() {
  try {
    await requireUser();
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("mark_all_notifications_read");
    if (error) {
      throw new Error(error.message);
    }
    return NextResponse.json({
      success: true,
      updated: data ?? 0,
    });
  } catch (error) {
    return routeError(error);
  }
}
