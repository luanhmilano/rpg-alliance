import type { Database } from "@/lib/db/supabase.types";

export type Db = Database;
export type DbSchema = Db["public"];
export type DbTables = DbSchema["Tables"];
export type DbTableName = keyof DbTables;

export type DbRow<T extends DbTableName> = DbTables[T]["Row"];
export type DbInsert<T extends DbTableName> = DbTables[T]["Insert"];
export type DbUpdate<T extends DbTableName> = DbTables[T]["Update"];

export type DbJson = import("@/lib/db/supabase.types").Json;
