/**
 * Catalog / lookup-table option types.
 * Used everywhere across repositories, services and API responses.
 * All shapes only expose human-readable fields; IDs are included only where
 * downstream consumers (forms, edit flows) need them for selection.
 */

export type RoleOptionDto = {
  id: string;
  name: string; // e.g. "MEMBER" | "KAGE"
};

export type VillageOptionDto = {
  id: string;
  name: string;
};

export type CharacterOptionDto = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type RankOptionDto = {
  id: string;
  value: string; // "C" | "B" | "A" | "S" | "SS" | "SSS"
};

export type TechniqueTypeOptionDto = {
  id: string;
  code: string; // "NINJUTSU" | "TAIJUTSU" | etc.
  name: string; // "Ninjutsu" | "Taijutsu" | etc.
};

/**
 * Used for targets and escapes displayed in technique detail views.
 * The `id` is kept for form pre-population; `code`/`description` for display.
 */
export type CatalogEntryDto = {
  id: string;
  code: string;
  description: string;
};
