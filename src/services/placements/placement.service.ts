import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import {
  confirmPlacementSchema,
  markPlacementJoinedSchema,
  closePlacementSchema,
  transitionPlacementSchema,
} from "@/lib/validators/placement.schema";
export async function confirmPlacement(input: {
  offerId: string;
  notes?: string;
}) {
  await requireRole(["placement_hr", "admin", "super_admin"]);
  const parsed = confirmPlacementSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_placement", {
    p_offer_id: parsed.offerId,
    p_notes: parsed.notes ?? null,
  });
  if (error) throw new Error(error.message);
  return { placementId: data as string };
}
export async function markPlacementJoined(input: {
  placementId: string;
  joinedAt?: string;
}) {
  await requireRole(["placement_hr", "admin", "super_admin"]);
  const parsed = markPlacementJoinedSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_placement_joined", {
    p_placement_id: parsed.placementId,
    p_joined_at: parsed.joinedAt ?? new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  return { success: true };
}
export async function closePlacement(input: {
  placementId: string;
  reason: string;
}) {
  await requireRole(["placement_hr", "admin", "super_admin"]);
  const parsed = closePlacementSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.rpc("close_placement", {
    p_placement_id: parsed.placementId,
    p_reason: parsed.reason,
  });
  if (error) throw new Error(error.message);
  return { success: true };
}
export async function transitionPlacement(input: {
  placementId: string;
  newStatus:
    | "joined"
    | "joining_deferred"
    | "offer_revoked"
    | "candidate_declined_after_acceptance"
    | "closed";
  reason?: string;
  effectiveAt?: string;
}) {
  await requireRole(["placement_hr", "admin", "super_admin"]);
  const parsed = transitionPlacementSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.rpc("transition_placement", {
    p_placement_id: parsed.placementId,
    p_new_status: parsed.newStatus,
    p_reason: parsed.reason ?? null,
    p_effective_at: parsed.effectiveAt ?? new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  return { success: true };
}
