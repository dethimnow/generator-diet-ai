import { createBrowserClient } from "@supabase/ssr";

/**
 * Fallbacki umożliwiają build CI bez sekretów; w runtime ustaw prawdziwe zmienne w .env.local / Vercel.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  return createBrowserClient(url, key);
}
