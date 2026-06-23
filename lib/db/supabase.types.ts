export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      villages: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ranks: {
        Row: {
          id: string;
          value: "C" | "B" | "A" | "S" | "SS" | "SSS";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          value: "C" | "B" | "A" | "S" | "SS" | "SSS";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          value?: "C" | "B" | "A" | "S" | "SS" | "SSS";
          created_at?: string;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          role_id: string;
          approved: boolean;
          email: string;
          phone: string | null;
          character_id: string | null;
          village_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          approved?: boolean;
          email: string;
          phone?: string | null;
          character_id?: string | null;
          village_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          approved?: boolean;
          email?: string;
          phone?: string | null;
          character_id?: string | null;
          village_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      techniques: {
        Row: {
          id: string;
          kind: "JUTSU" | "SUMMONING";
          technique_type_id: string;
          name: string;
          rank_id: string;
          link: string | null;
          observations: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kind: "JUTSU" | "SUMMONING";
          technique_type_id: string;
          name: string;
          rank_id: string;
          link?: string | null;
          observations?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          kind?: "JUTSU" | "SUMMONING";
          technique_type_id?: string;
          name?: string;
          rank_id?: string;
          link?: string | null;
          observations?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jutsus: {
        Row: {
          id: string | null;
          technique_id: string | null;
          name: string | null;
          type: "Ninjutsu" | "Taijutsu" | "Dojutsu" | "Genjutsu" | null;
          rank: "C" | "B" | "A" | "S" | "SS" | "SSS" | null;
          description: string | null;
          chackra: number | null;
          price: number | null;
          atk: string | null;
          observations: string | null;
          requirements: string | null;
          escape: string | null;
          link: string | null;
          characters: string[] | null;
          cooldown: number | null;
          targets: string | null;
          available_to_roles: Array<"KAGE" | "MEMBER"> | null;
          updated_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          technique_id?: string | null;
          id?: string;
          name?: string;
          type?: "Ninjutsu" | "Taijutsu" | "Dojutsu" | "Genjutsu";
          rank?: "C" | "B" | "A" | "S" | "SS" | "SSS";
          description?: string;
          chackra?: number;
          price?: number;
          atk?: string | null;
          observations?: string | null;
          requirements?: string | null;
          escape?: string | null;
          link?: string;
          characters?: string[] | null;
          cooldown?: number | null;
          targets?: string | null;
          available_to_roles?: Array<"KAGE" | "MEMBER">;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: "Ninjutsu" | "Taijutsu" | "Dojutsu" | "Genjutsu";
          rank?: "C" | "B" | "A" | "S" | "SS" | "SSS";
          description?: string;
          chackra?: number;
          price?: number;
          atk?: string | null;
          observations?: string | null;
          requirements?: string | null;
          escape?: string | null;
          link?: string;
          characters?: string[] | null;
          cooldown?: number | null;
          targets?: string | null;
          available_to_roles?: Array<"KAGE" | "MEMBER">;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      summonings: {
        Row: {
          technique_id: string;
        };
        Insert: {
          technique_id: string;
        };
        Update: {
          technique_id?: string;
        };
      };
      technique_costs: {
        Row: {
          id: string;
          technique_id: string;
          resource: "CK" | "HP" | "AG";
          amount: number;
          frequency: "ONE_TIME" | "ACTIVATION" | "PER_TURN";
          created_at: string;
        };
        Insert: {
          id?: string;
          technique_id: string;
          resource: "CK" | "HP" | "AG";
          amount: number;
          frequency: "ONE_TIME" | "ACTIVATION" | "PER_TURN";
          created_at?: string;
        };
        Update: {
          id?: string;
          technique_id?: string;
          resource?: "CK" | "HP" | "AG";
          amount?: number;
          frequency?: "ONE_TIME" | "ACTIVATION" | "PER_TURN";
          created_at?: string;
        };
      };
      technique_limits: {
        Row: {
          technique_id: string;
          has_turn_limit: boolean;
          max_active_turns: number | null;
          has_fight_use_limit: boolean;
          max_uses_per_fight: number | null;
          has_card_use_limit: boolean;
          max_uses_per_card: number | null;
        };
        Insert: {
          technique_id: string;
          has_turn_limit?: boolean;
          max_active_turns?: number | null;
          has_fight_use_limit?: boolean;
          max_uses_per_fight?: number | null;
          has_card_use_limit?: boolean;
          max_uses_per_card?: number | null;
        };
        Update: {
          technique_id?: string;
          has_turn_limit?: boolean;
          max_active_turns?: number | null;
          has_fight_use_limit?: boolean;
          max_uses_per_fight?: number | null;
          has_card_use_limit?: boolean;
          max_uses_per_card?: number | null;
        };
      };
      technique_prices: {
        Row: {
          id: string;
          technique_id: string;
          price_context: "TECHNIQUE_PURCHASE" | "SUMMON_UNIT_PURCHASE" | "OTHER";
          amount: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          technique_id: string;
          price_context: "TECHNIQUE_PURCHASE" | "SUMMON_UNIT_PURCHASE" | "OTHER";
          amount: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          technique_id?: string;
          price_context?: "TECHNIQUE_PURCHASE" | "SUMMON_UNIT_PURCHASE" | "OTHER";
          amount?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      technique_types: {
        Row: {
          id: string;
          code: "NINJUTSU" | "TAIJUTSU" | "GENJUTSU" | "DOJUTSU" | "SUMMONING";
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: "NINJUTSU" | "TAIJUTSU" | "GENJUTSU" | "DOJUTSU" | "SUMMONING";
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: "NINJUTSU" | "TAIJUTSU" | "GENJUTSU" | "DOJUTSU" | "SUMMONING";
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      technique_effects: {
        Row: {
          id: string;
          technique_id: string;
          target_scope: "SELF" | "ALLY" | "ENEMY" | "AREA";
          affected_attribute: string;
          effect_kind: "FIXED" | "BUFF" | "BARRIER" | "SPECIAL";
          operation: "SET" | "ADD" | "SUB" | "MULTIPLY";
          execution_order: number | null;
        };
        Insert: {
          id?: string;
          technique_id: string;
          target_scope: "SELF" | "ALLY" | "ENEMY" | "AREA";
          affected_attribute: string;
          effect_kind: "FIXED" | "BUFF" | "BARRIER" | "SPECIAL";
          operation: "SET" | "ADD" | "SUB" | "MULTIPLY";
          execution_order?: number | null;
        };
        Update: {
          id?: string;
          technique_id?: string;
          target_scope?: "SELF" | "ALLY" | "ENEMY" | "AREA";
          affected_attribute?: string;
          effect_kind?: "FIXED" | "BUFF" | "BARRIER" | "SPECIAL";
          operation?: "SET" | "ADD" | "SUB" | "MULTIPLY";
          execution_order?: number | null;
        };
      };
      technique_effect_values: {
        Row: {
          effect_id: string;
          value_type: "NUMERIC" | "TEXT" | "TOKEN";
          value_numeric: number | null;
          value_text: string | null;
          value_token: string | null;
        };
        Insert: {
          effect_id: string;
          value_type: "NUMERIC" | "TEXT" | "TOKEN";
          value_numeric?: number | null;
          value_text?: string | null;
          value_token?: string | null;
        };
        Update: {
          effect_id?: string;
          value_type?: "NUMERIC" | "TEXT" | "TOKEN";
          value_numeric?: number | null;
          value_text?: string | null;
          value_token?: string | null;
        };
      };
      targets: {
        Row: {
          id: string;
          code: string;
          description: string;
        };
        Insert: {
          id?: string;
          code: string;
          description: string;
        };
        Update: {
          id?: string;
          code?: string;
          description?: string;
        };
      };
      technique_targets: {
        Row: {
          technique_id: string;
          target_id: string;
        };
        Insert: {
          technique_id: string;
          target_id: string;
        };
        Update: {
          technique_id?: string;
          target_id?: string;
        };
      };
      escapes: {
        Row: {
          id: string;
          code: string;
          description: string;
        };
        Insert: {
          id?: string;
          code: string;
          description: string;
        };
        Update: {
          id?: string;
          code?: string;
          description?: string;
        };
      };
      technique_escapes: {
        Row: {
          technique_id: string;
          escape_id: string;
        };
        Insert: {
          technique_id: string;
          escape_id: string;
        };
        Update: {
          technique_id?: string;
          escape_id?: string;
        };
      };
      technique_updates: {
        Row: {
          id: string;
          event_type: "INSERT" | "UPDATE" | "DELETE";
          technique_id: string | null;
          technique_name_snapshot: string;
          changed_by: string | null;
          changed_fields: string[];
          before_snapshot: Json | null;
          after_snapshot: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: "INSERT" | "UPDATE" | "DELETE";
          technique_id?: string | null;
          technique_name_snapshot: string;
          changed_by?: string | null;
          changed_fields: string[];
          before_snapshot?: Json | null;
          after_snapshot?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: "INSERT" | "UPDATE" | "DELETE";
          technique_id?: string | null;
          technique_name_snapshot?: string;
          changed_by?: string | null;
          changed_fields?: string[];
          before_snapshot?: Json | null;
          after_snapshot?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
