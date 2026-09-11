import "server-only";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  requireRole,
} from "@/lib/auth/guards";

import {
  markPlacementJoinedSchema,
  closePlacementSchema,
} from "@/lib/validators/placement.schema";

export async function
markPlacementJoined(
  input: {
    placementId:
      string;
    joinedAt?:
      string;
  }
) {

  await requireRole([
    "placement_hr",
    "admin",
    "super_admin",
  ]);

  const parsed =
    markPlacementJoinedSchema
      .parse(input);

  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "mark_placement_joined",
      {
        p_placement_id:
          parsed.placementId,

        p_joined_at:
          parsed.joinedAt ??
          new Date()
            .toISOString(),
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return {
    success: true,
  };
}

export async function
closePlacement(
  input: {
    placementId:
      string;
    reason:
      string;
  }
) {

  await requireRole([
    "placement_hr",
    "admin",
    "super_admin",
  ]);

  const parsed =
    closePlacementSchema
      .parse(input);

  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "close_placement",
      {
        p_placement_id:
          parsed.placementId,

        p_reason:
          parsed.reason,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return {
    success: true,
  };
}