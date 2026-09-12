import { routeError } from "@/lib/http/route-error";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { getCurrentRoles, requireUser } from "@/lib/auth/guards";

import { createOfferSignedUrl } from "@/services/offers/offer-file.service";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const user = await requireUser();

    const { id } = await context.params;

    const { data: offer, error } = await supabaseAdmin
      .from("offers")
      .select(
        `
          id,
          storage_path,
          student_id,
          company_id,
          job_id
        `,
      )
      .eq("id", id)
      .single();

    if (error || !offer) {
      throw new Error("Offer not found");
    }

    const { data: studentProfile } = await supabaseAdmin
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let allowed = studentProfile?.id === offer.student_id;

    if (!allowed) {
      const { data: clientProfile } = await supabaseAdmin
        .from("client_hr_profiles")
        .select("company_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      allowed = clientProfile?.company_id === offer.company_id;
    }

    if (!allowed) {
      const roles = await getCurrentRoles(user.id);
      allowed = roles.some(
        (role) => role === "admin" || role === "super_admin",
      );
      if (!allowed && roles.includes("placement_hr")) {
        const { data: assignedJob } = await supabaseAdmin
          .from("jobs")
          .select("id")
          .eq("id", offer.job_id)
          .eq("assigned_placement_hr", user.id)
          .maybeSingle();
        allowed = Boolean(assignedJob);
      }
    }

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authorized",
        },
        {
          status: 403,
        },
      );
    }

    const signedUrl = await createOfferSignedUrl(offer.storage_path);

    return NextResponse.json({
      success: true,
      signedUrl,
      expiresIn: 300,
    });
  } catch (error) {
    return routeError(error);
  }
}
