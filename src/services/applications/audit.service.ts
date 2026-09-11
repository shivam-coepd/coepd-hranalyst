import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

interface AuditInput {
  actorUserId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: string;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
  requestId?: string | null;
}

export async function writeAuditLog(input: AuditInput): Promise<void> {
  const { error } = await supabaseAdmin.from("audit_logs").insert({
    actor_user_id: input.actorUserId ?? null,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    action: input.action,
    old_data: input.oldData ?? null,
    new_data: input.newData ?? null,
    metadata: input.metadata ?? {},
    request_id: input.requestId ?? null,
  });

  if (error) throw new Error(`Audit log failed: ${error.message}`);
}
