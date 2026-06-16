export const TECHNIQUE_KINDS = ["JUTSU", "SUMMONING"] as const;
export const TECHNIQUE_TYPE_CODES = [
	"NINJUTSU",
	"TAIJUTSU",
	"GENJUTSU",
	"DOJUTSU",
	"SUMMONING",
] as const;
export const COST_RESOURCES = ["CK", "HP"] as const;
export const COST_FREQUENCIES = ["ONE_TIME", "ACTIVATION", "PER_TURN"] as const;
export const PRICE_CONTEXTS = [
	"TECHNIQUE_PURCHASE",
	"SUMMON_UNIT_PURCHASE",
	"OTHER",
] as const;
export const TARGET_SCOPES = ["SELF", "ALLY", "ENEMY", "AREA"] as const;
export const EFFECT_KINDS = ["FIXED", "BUFF", "BARRIER", "SPECIAL"] as const;
export const EFFECT_OPERATIONS = ["SET", "ADD", "SUB", "MULTIPLY"] as const;
export const EFFECT_VALUE_TYPES = ["NUMERIC", "TEXT", "TOKEN"] as const;
