// Server-only audit log helper
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function recordAudit(params: {
  userId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await supabaseAdmin.from("audit_log").insert({
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    metadata: (params.metadata ?? {}) as never,
  });
}
