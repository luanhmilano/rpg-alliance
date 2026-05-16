# Database Modeling

## Objective

Model jutsus and summonings in a relational way, keeping consistency for both simple and complex cases:

- techniques with fixed numeric values (example: atk 20k)
- buff techniques (example: +20k)
- techniques with activation upkeep cost per turn
- techniques with turn limits and/or fight usage limits
- techniques with special text values (example: Unlimited, Instant Regeneration)

## Conventions

- A field marked as **Required = Yes** must always exist.
- A field marked as **Required = No** is optional.
- IDs and FKs use `uuid` for consistency.

## Entities

### 1. Players

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | Player PK |
| role_id | uuid | Yes | FK to Roles |
| approved | boolean | Yes | Approval status |
| email | text | Yes | Login identifier |
| phone | text | No | Optional official user verification |
| character_id | uuid | No | FK to Characters |
| village_id | uuid | No | FK to Villages |
| created_at | timestamp | Yes | Creation timestamp |
| updated_at | timestamp | Yes | Update timestamp |

### 2. Roles

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | Role PK |
| name | text | Yes | Example: KAGE, MEMBER |
| created_at | timestamp | Yes | Creation timestamp |
| updated_at | timestamp | Yes | Update timestamp |

### 3. Characters

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | Character PK |
| name | text | Yes | Character name |
| avatar_url | text | No | Avatar image URL |
| created_at | timestamp | Yes | Creation timestamp |
| updated_at | timestamp | Yes | Update timestamp |

### 4. Villages

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | Village PK |
| name | text | Yes | Village name |
| created_at | timestamp | Yes | Creation timestamp |
| updated_at | timestamp | Yes | Update timestamp |

### 5. Ranks

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | Rank PK |
| value | text | Yes | C, B, A, S, SS, SSS |
| created_at | timestamp | Yes | Creation timestamp |
| updated_at | timestamp | Yes | Update timestamp |

### 6. Techniques (Base)

Base table to represent any technique: jutsu or summoning.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | Technique PK |
| kind | text | Yes | JUTSU or SUMMONING |
| name | text | Yes | Technique name |
| rank_id | uuid | Yes | FK to Ranks |
| link | text | No | Reference URL |
| observations | text | No | General notes |
| updated_by | uuid | No | FK to Players (last editor) |
| created_at | timestamp | Yes | Creation timestamp |
| updated_at | timestamp | Yes | Update timestamp |

### 7. Jutsus

Subtype of Techniques for jutsu-only data.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| technique_id | uuid | Yes | PK/FK to Techniques |

### 8. Summonings

Subtype of Techniques for summoning-only data.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| technique_id | uuid | Yes | PK/FK to Techniques |

### 9. Technique_Costs

Represents one-time, activation, and upkeep-per-turn costs.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | Cost PK |
| technique_id | uuid | Yes | FK to Techniques |
| resource | text | Yes | Example: CK, HP |
| amount | numeric | Yes | Cost value |
| frequency | text | Yes | ONE_TIME, ACTIVATION, PER_TURN |
| created_at | timestamp | Yes | Creation timestamp |

### 10. Technique_Limits

Defines turn limits and/or fight usage limits.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| technique_id | uuid | Yes | PK/FK to Techniques |
| has_turn_limit | boolean | Yes | Whether a turn limit exists |
| max_active_turns | integer | No | Maximum active turns |
| has_fight_use_limit | boolean | Yes | Whether a fight usage limit exists |
| max_uses_per_fight | integer | No | Maximum uses per fight |

### 11. Technique_Effects

Represents what the technique does to target or caster.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | Effect PK |
| technique_id | uuid | Yes | FK to Techniques |
| target_scope | text | Yes | SELF, ALLY, ENEMY, AREA |
| affected_attribute | text | Yes | ATK, DEF, AG, HP, CK etc |
| effect_kind | text | Yes | FIXED, BUFF, BARRIER, SPECIAL |
| operation | text | Yes | SET, ADD, SUB, MULTIPLY |
| execution_order | integer | No | Effect execution order |

### 12. Technique_Effect_Values

Allows numeric values, free text, or cataloged tokens.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| effect_id | uuid | Yes | PK/FK to Technique_Effects |
| value_type | text | Yes | NUMERIC, TEXT, TOKEN |
| value_numeric | numeric | No | Numeric value (example: 20000) |
| value_text | text | No | Text value (example: Instant Regeneration) |
| value_token | text | No | Cataloged token (example: UNLIMITED) |

### 13. Targets

Target type catalog.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | Target PK |
| code | text | Yes | Unique target code |
| description | text | Yes | Target description |

### 14. Technique_Targets

N:N relation between Techniques and Targets.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| technique_id | uuid | Yes | FK to Techniques |
| target_id | uuid | Yes | FK to Targets |

### 15. Escapes

Escape option catalog.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | Escape option PK |
| code | text | Yes | Unique escape code |
| description | text | Yes | Escape description |

### 16. Technique_Escapes

N:N relation between Techniques and Escapes.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| technique_id | uuid | Yes | FK to Techniques |
| escape_id | uuid | Yes | FK to Escapes |

### 17. Technique_Updates

Technique change history/audit.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | uuid | Yes | Event PK |
| technique_id | uuid | Yes | FK to Techniques |
| changed_by | uuid | Yes | FK to Players |
| changed_fields | text[] | Yes | Updated fields |
| before_snapshot | json | No | Previous state |
| after_snapshot | json | No | New state |
| created_at | timestamp | Yes | Creation timestamp |

## Modeling Rules (Documentation)

- A technique should have at least one record in Technique_Effects.
- An effect may represent fixed attack (SET), buff (ADD), or defense/barrier.
- Special values such as "Unlimited" and "Instant Regeneration" are stored in Technique_Effect_Values.
- Turn limits and per-turn costs are optional and only exist for techniques that require this control.