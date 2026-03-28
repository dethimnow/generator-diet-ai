import { createClient } from "@supabase/supabase-js";

/** Tylko po stronie serwera (webhook Stripe, joby) */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Brak SUPABASE_SERVICE_ROLE_KEY lub URL");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
