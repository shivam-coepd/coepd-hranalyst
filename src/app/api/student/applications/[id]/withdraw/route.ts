import { NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireRole("student");
    const { id: applicationId } = await params;

    const { data: student } = await supabaseAdmin
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      throw new Error("Student profile not found");
    }

    const { error } = await supabaseAdmin.rpc("withdraw_student_application" as any, {
      p_application_id: applicationId,
      p_student_id: student.id,
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (e) {
    return routeError(e);
  }
}
