import { createClient } from "@supabase/supabase-js";

// Publishable key: safe in the browser. Every table is behind row-level security,
// and every read of team intel requires a signed-in scout.
const URL = import.meta.env.VITE_SUPABASE_URL || "https://hapdhoqlouxezgdpfvuu.supabase.co";
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_-_oPlNI4BWvSTgO2OLINQQ_jsqDhgS1";

export const supabase = createClient(URL, KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
