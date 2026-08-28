import { createClient } from "@supabase/supabase-js";

let rawUrl = import.meta.env.VITE_SUPABASE_URL || "";
// Remover sufixos de REST API se o usuário tiver colado a URL da REST API diretamente
if (rawUrl) {
  rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

const supabaseUrl = rawUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "SUA_URL_DO_SUPABASE" &&
  supabaseAnonKey !== "SUA_CHAVE_ANON_DO_SUPABASE"
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
