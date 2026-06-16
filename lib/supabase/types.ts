import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/supabase.types";

export type TypedSupabaseClient = SupabaseClient<Database>;
