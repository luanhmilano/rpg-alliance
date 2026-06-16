# EXECUTION_ORDER.md - Ordem Exata de Execução

## ⚡ Quick Start

Para setup rápido em novo projeto Supabase:

1. Abra Supabase SQL Editor
2. Cole o conteúdo do **`run_all_migrations.sql`**
3. Execute ✅

Ou siga a ordem abaixo arquivo por arquivo.

---

## 📋 Ordem de Execução - Arquivo por Arquivo

### PHASE 1: SCHEMA (Estrutura de dados)
Cria 19 tabelas + 1 índice única

| # | Arquivo | Descrição | Tabelas |
|---|---------|-----------|---------|
| 1 | `01-schema/01-core-entities.sql` | Core lookup tables | roles, villages, ranks, technique_types |
| 2 | `01-schema/02-players-structure.sql` | Player system | characters, players |
| 3 | `01-schema/03-techniques-structure.sql` | Technique system completo | techniques, jutsus, summonings, technique_costs, technique_limits, technique_effects, technique_effect_values, targets, technique_targets, escapes, technique_escapes, technique_prices |
| 4 | `01-schema/04-audit-structure.sql` | Audit trail | technique_updates |

**⏱️ Tempo estimado**: 5 segundos

---

### PHASE 2: FUNCTIONS (Lógica do banco)
Cria 6 functions + 1 trigger function

| # | Arquivo | Funções Criadas | Dependências |
|---|---------|-----------------|--------------|
| 5 | `02-functions/01-utility-functions.sql` | `set_updated_at()` | Nenhuma |
| 6 | `02-functions/02-auth-functions.sql` | `is_kage()`, `can_update_players()`, `handle_new_auth_user()` | Tabelas de schema |
| 7 | `02-functions/03-technique-functions.sql` | `log_technique_lifecycle()` | `technique_updates` table |

**⏱️ Tempo estimado**: 2 segundos

---

### PHASE 3: TRIGGERS (Automação)
Cria 8 triggers

| # | Arquivo | Triggers Criados | On Tables |
|---|---------|------------------|-----------|
| 8 | `03-triggers/01-timestamp-triggers.sql` | 7x `set_updated_at` triggers | roles, villages, ranks, technique_types, characters, players, techniques |
| 9 | `03-triggers/02-audit-triggers.sql` | `log_technique_lifecycle`, `on_auth_user_created` | techniques, auth.users |

**⏱️ Tempo estimado**: 1 segundo  
**Dependência**: Phase 2 (Functions) MUST be done first

---

### PHASE 4: ROW LEVEL SECURITY (Segurança)
Ativa RLS + Define 45+ políticas

| # | Arquivo | O que faz | Tabelas Afetadas |
|---|---------|-----------|------------------|
| 10 | `04-rls/01-rls-enable.sql` | Enable RLS | 19 tabelas (todas) |
| 11 | `04-rls/02-public-tables-policies.sql` | Políticas de leitura pública | roles, villages, ranks, technique_types, characters, targets, escapes |
| 12 | `04-rls/03-players-policies.sql` | Políticas de player | players |
| 13 | `04-rls/04-techniques-policies.sql` | Políticas KAGE-only | techniques, jutsus, summonings, costs, limits, effects, etc |

**⏱️ Tempo estimado**: 3 segundos

---

### PHASE 5: GRANTS (Permissões)
Define grants por role

| # | Arquivo | Grants Para | O que recebe |
|---|---------|-------------|-------------|
| 14 | `05-grants/01-anon-grants.sql` | anon role | SELECT em 4 tabelas públicas |
| 15 | `05-grants/02-authenticated-grants.sql` | authenticated role | SELECT/UPDATE/INSERT/DELETE conforme RLS |

**⏱️ Tempo estimado**: 1 segundo

---

### PHASE 6: INDEXES (Performance)
Cria 23 índices

| # | Arquivo | Índices | Cobertura |
|---|---------|---------|-----------|
| 16 | `06-indexes/01-all-indexes.sql` | 23 índices | players, techniques, relationships |

**⏱️ Tempo estimado**: 2 segundos

---

### PHASE 7: SEEDS (Dados iniciais)
Insere 30+ registros de dados base

| # | Arquivo | Inserts | Quantidade |
|---|---------|---------|-----------|
| 17 | `07-seeds/01-roles.sql` | Roles: MEMBER, KAGE | 2 |
| 18 | `07-seeds/02-ranks.sql` | Ranks: C, B, A, S, SS, SSS | 6 |
| 19 | `07-seeds/03-technique-types.sql` | Technique Types: NINJUTSU, TAIJUTSU, ... | 5 |
| 20 | `07-seeds/04-villages.sql` | Villages | 0 (comentado) |
| 21 | `07-seeds/05-targets-escapes.sql` | Targets (6) + Escapes (5) | 11 |

**⏱️ Tempo estimado**: 1 segundo  
**Total após seeds**: 30 registros base

---

## 🎯 Checkpoints

Após cada phase, verifique:

- ✅ **Phase 1**: Verifique 19 tabelas em "Tables" (Supabase)
- ✅ **Phase 2**: Verifique 6 functions em "Functions" (Supabase)
- ✅ **Phase 3**: Verifique 8 triggers em "Triggers" (Supabase)
- ✅ **Phase 4**: Verifique RLS ligado (Schema > Table > RLS)
- ✅ **Phase 5**: Verifique grants (não visível no UI, confie no erro)
- ✅ **Phase 6**: Verifique 23+ índices em "Indexes"
- ✅ **Phase 7**: Verifique dados em `roles`, `ranks`, `technique_types`

## 🚨 Dependências Críticas

```
┌─────────────┐
│ PHASE 1     │ ← Todas as tabelas
│ SCHEMA      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PHASE 2     │ ← Functions (precisa das tabelas)
│ FUNCTIONS   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PHASE 3     │ ← Triggers (precisa das functions)
│ TRIGGERS    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PHASE 4     │ ← RLS (deve vir após tudo)
│ RLS         │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PHASE 5     │ ← Grants (após RLS)
│ GRANTS      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PHASE 6     │ ← Indexes (performance, pode ser antes/depois)
│ INDEXES     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PHASE 7     │ ← Seeds (dados iniciais)
│ SEEDS       │
└─────────────┘
```

**🔴 NÃO PULE PHASES**  
**🔴 SEMPRE RESPEITE A ORDEM**

---

## ⏱️ Tempo Total

| Phase | Tempo | Cumulative |
|-------|-------|-----------|
| 1 - Schema | 5s | 5s |
| 2 - Functions | 2s | 7s |
| 3 - Triggers | 1s | 8s |
| 4 - RLS | 3s | 11s |
| 5 - Grants | 1s | 12s |
| 6 - Indexes | 2s | 14s |
| 7 - Seeds | 1s | **15s total** ✅ |

---

## 🛠️ Alternativas de Execução

### Opção A: Tudo de Uma Vez (RECOMENDADO)
```sql
-- Cole run_all_migrations.sql
-- Execute tudo de uma vez
```
✅ Rápido (15 segundos)  
✅ Sem risco de pular phase  
✅ Todas as dependências garantidas

### Opção B: Arquivo por Arquivo
```bash
# Terminal / Supabase CLI
supabase db execute < 01-schema/01-core-entities.sql
supabase db execute < 01-schema/02-players-structure.sql
...
```
✅ Verificar cada step  
⚠️ Risco de pular order  
⏱️ Mais lento

### Opção C: Pasta por Pasta
```bash
# Execute todos os arquivos de 01-schema/
# Depois todos de 02-functions/
# ... etc
```
✅ Balanço entre controle e velocidade  
✅ Respeita dependências  
⏱️ Médio (alguns passos)

---

## ❌ Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| "table does not exist" | Fez phase fora de ordem | Recomeça do 01-schema |
| "function does not exist" | Fez 03-triggers antes de 02-functions | Recomeça de 02-functions |
| "Permission denied" | Fez 04-rls antes de 05-grants | Recomeça de 05-grants |
| "Duplicate key value" | Rodou seeds duas vezes | É safe (on conflict), rodar novamente |
| "Foreign key violation" | Inseriu dados antes de seeds | Rode seeds primeiro |

---

## 📝 Pré-requisitos

- ✅ Supabase projeto criado
- ✅ Access a SQL Editor
- ✅ Permissão de criar tabelas/functions/triggers
- ✅ 15 segundos de paciência 😄

---

## 🎉 Próximos Passos

Após completar todas as 7 phases:

1. Teste RLS
   ```sql
   SELECT * FROM public.roles;  -- Should work (public)
   SELECT * FROM public.players;  -- Should fail (need auth)
   ```

2. Crie user KAGE
   - Via Supabase Auth UI
   - Após signup, update `players` table: `approved = true`, `role_id = kage_id`

3. Teste permissões
   - Login como MEMBER
   - Tente criar technique (deve falhar)
   - Login como KAGE
   - Tente criar technique (deve funcionar)

4. Customize
   - Adicione villages em `07-seeds/04-villages.sql`
   - Customize seeds conforme necessário
   - Adicione dados via API

---

**Versionamento**: 2.0  
**Última revisão**: 2026-05-21  
**Status**: ✅ Production Ready
