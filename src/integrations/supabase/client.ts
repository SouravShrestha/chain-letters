import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("⚠️ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Supabase client will not work.");
}

export const supabase = createClient<Database>(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
