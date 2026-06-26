import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const SUPABASE_URL = "https://tgnljwvuilmeubgjypzq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbmxqd3Z1aWxtZXViZ2p5cHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODMwODksImV4cCI6MjA5ODA1OTA4OX0.qYnT08mSJ4jpPt0wuzMXYW7qlX3ua1_pQ4c697QwTS0";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: gera URL pública de um arquivo no storage
export function storageUrl(bucket: string, path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
