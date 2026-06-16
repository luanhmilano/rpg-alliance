# MigrationsV2 - Supabase Database Structure

## Overview

This is a reorganized and well-documented migration structure for the RPG Alliance project. It's designed to be:

- **Modular**: Each concern is separated into logical files
- **Portable**: Easy to migrate to a new Supabase project
- **Clear**: Well-documented with comments explaining each step
- **Auditable**: Tracks all changes and maintains data integrity

## Directory Structure

```
migrationsV2/
├── 01-schema/              # Table and entity definitions
├── 02-functions/           # Database functions
├── 03-triggers/            # Automated triggers
├── 04-rls/                 # Row Level Security policies
├── 05-grants/              # User permission grants
├── 06-indexes/             # Performance indexes
├── 07-seeds/               # Initial data
└── README.md               # This file
```

## Migration Order

**Always execute migrations in this order** to ensure dependencies are satisfied:

1. **01-schema** - Create all tables and indexes
   - 01-core-entities.sql (Roles, Villages, Ranks, Technique Types)
   - 02-players-structure.sql (Characters, Players)
   - 03-techniques-structure.sql (Techniques and all related tables)
   - 04-audit-structure.sql (Audit trail tables)

2. **02-functions** - Create database functions
   - 01-utility-functions.sql (set_updated_at)
   - 02-auth-functions.sql (Authentication helpers)
   - 03-technique-functions.sql (Audit logging)

3. **03-triggers** - Set up automatic triggers
   - 01-timestamp-triggers.sql (Auto update_at)
   - 02-audit-triggers.sql (Audit logging, auth user creation)

4. **04-rls** - Enable and configure Row Level Security
   - 01-rls-enable.sql (Enable RLS on all tables)
   - 02-public-tables-policies.sql (Public read-only tables)
   - 03-players-policies.sql (Player record access control)
   - 04-techniques-policies.sql (Technique management access)

5. **05-grants** - Set user permissions
   - 01-anon-grants.sql (Anonymous user permissions)
   - 02-authenticated-grants.sql (Authenticated user permissions)

6. **06-indexes** - Create performance indexes
   - 01-all-indexes.sql (All performance indexes)

7. **07-seeds** - Insert initial data
   - 01-roles.sql (MEMBER, KAGE roles)
   - 02-ranks.sql (C, B, A, S, SS, SSS ranks)
   - 03-technique-types.sql (NINJUTSU, TAIJUTSU, etc.)
   - 04-villages.sql (Village data)
   - 05-targets-escapes.sql (Game mechanics reference)

## Key Design Decisions

### Schema Organization

- **Core Entities**: Foundational lookup tables used throughout
- **Player Structure**: Relationship between auth.users and game players
- **Techniques System**: Comprehensive technique definition with costs, limits, effects
- **Audit Trail**: Complete history of all changes

### Security Model

- **RLS (Row Level Security)**: All tables have RLS enabled
- **Role-Based Access**: KAGE role has administrative privileges
- **Principle of Least Privilege**: Users can only see/modify their own data
- **Public Lookups**: Roles, villages, ranks are readable by everyone

### Performance Considerations

- Strategic indexes on foreign keys and frequently searched columns
- Efficient timestamp management with triggers
- Audit trail stored separately to avoid impacting main tables

## Using These Migrations

### In Supabase Console

1. Open your project in Supabase
2. Go to the SQL Editor
3. Copy the contents of each file in order
4. Execute each file
5. Verify schema in the Schema Editor

### In a New Supabase Project

1. Create a new Supabase project
2. In SQL Editor, execute all migration files in the specified order
3. Verify the schema is correctly created
4. Seeds should populate automatically

### With Supabase CLI

```bash
# Create a new migration
supabase migration new migration_name

# Then copy the contents of these files into the migration

# Apply migrations
supabase db push
```

## Important Notes

- **Execute in order**: Dependencies exist between files
- **Idempotent operations**: All files use `if not exists` and `on conflict` to be safe
- **RLS must be enabled before policies**: This is handled automatically
- **Seeds are optional**: Customize 04-villages.sql for your world
- **Functions are security definer**: Some functions run with elevated privileges for security

## Access Control Summary

| Role | Capability |
|------|-----------|
| **Anonymous** | Read: roles, villages, ranks, characters |
| **Authenticated (MEMBER)** | Read: all tables; Update: own player record; Read audit trail |
| **Authenticated (KAGE)** | Read/Write/Delete: all tables; Approve players; Manage techniques |

## Relationship Diagram

```
auth.users (Supabase Auth)
    ↓
players ← ← ← ← ← → characters
    ↓                   ↓
   role_id            village_id
    ↓
  roles

techniques ← ← ← → technique_types, ranks
    ├→ jutsus / summonings
    ├→ technique_costs
    ├→ technique_limits
    ├→ technique_effects → technique_effect_values
    ├→ technique_targets → targets
    ├→ technique_escapes → escapes
    ├→ technique_prices
    └→ technique_updates (audit)
```

## Customization Guide

### Adding New Roles

Edit `07-seeds/01-roles.sql`:
```sql
insert into public.roles (name, description)
values ('NEW_ROLE', 'Description of new role')
on conflict (name) do nothing;
```

### Adding New Villages

Edit `07-seeds/04-villages.sql`:
```sql
insert into public.villages (name, description)
values ('Village Name', 'Village description')
on conflict (name) do nothing;
```

### Modifying RLS Policies

Edit the appropriate file in `04-rls/` - policies follow this pattern:
- Public tables: readable by all
- User tables: readable by owner or KAGE
- Technique tables: readable by authenticated, writable by KAGE only

### Adding New Techniques

Use the API with authenticated user:
```typescript
const { data } = await supabase
  .from('techniques')
  .insert({
    kind: 'JUTSU',
    technique_type_id: typeId,
    name: 'New Technique',
    rank_id: rankId,
    updated_by: userId
  })
```

## Troubleshooting

### "Permission denied" errors
- Check RLS policies are created
- Verify grants are applied
- Ensure user has correct role

### "Foreign key constraint violation"
- Seeds must be run before inserting techniques
- Roles must exist before creating players

### "Duplicate key value" errors
- Most inserts use `on conflict do nothing`
- Check if data already exists

### Performance issues
- Verify indexes are created in 06-indexes
- Check query execution plans in Supabase UI

## Version History

- **V2.0**: Reorganized migrations with better documentation
- **V1.0**: Original monolithic migration files (deprecated)

## Support & Questions

For questions about the schema structure, see `lib/supabase/` documentation files.
