import { createClient } from "@supabase/supabase-js";

// Service-role client. Only import this in server-only routes (cron, webhooks).
// It bypasses RLS, so never ship it to the browser or use it in user-facing
// server actions.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
