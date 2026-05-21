# MigrationsV2 - Guia Rápido da Estrutura

## 📁 Organização

```
migrationsV2/
├── 01-schema/              5 arquivos - Definição de todas as tabelas
├── 02-functions/           3 arquivos - Funções do banco de dados
├── 03-triggers/            2 arquivos - Triggers automáticos
├── 04-rls/                 4 arquivos - Políticas de segurança (RLS)
├── 05-grants/              2 arquivos - Permissões de usuários
├── 06-indexes/             1 arquivo  - Índices de performance
├── 07-seeds/               5 arquivos - Dados iniciais
├── run_all_migrations.sql  1 arquivo  - Script completo (tudo junto)
├── README.md               Documentação completa
└── STRUCTURE.md            Este arquivo (guia rápido)
```

**Total: 22 arquivos SQL + 2 docs = Estrutura bem organizada e portável**

## 🎯 Ordem Correta de Execução

### 1️⃣ **Schema (01-schema/)** - Estrutura de dados
Cria 19 tabelas com relacionamentos e constraints:
- `01-core-entities.sql` → Roles, Villages, Ranks, Technique Types
- `02-players-structure.sql` → Characters, Players
- `03-techniques-structure.sql` → Técnicas e tudo relacionado (8 tabelas)
- `04-audit-structure.sql` → Log de auditoria

### 2️⃣ **Functions (02-functions/)** - Lógica do banco
Cria 6 funções importantes:
- `01-utility-functions.sql` → `set_updated_at()`
- `02-auth-functions.sql` → `is_kage()`, `can_update_players()`, `handle_new_auth_user()`
- `03-technique-functions.sql` → `log_technique_lifecycle()`

### 3️⃣ **Triggers (03-triggers/)** - Automação
Cria 8 triggers:
- `01-timestamp-triggers.sql` → Auto-update `updated_at` em 7 tabelas
- `02-audit-triggers.sql` → Log de técnicas + trigger de novo usuário

### 4️⃣ **RLS (04-rls/)** - Segurança
Ativa RLS e define 45+ políticas:
- `01-rls-enable.sql` → Enable RLS em todas as 19 tabelas
- `02-public-tables-policies.sql` → Leitura pública para tabelas de lookup
- `03-players-policies.sql` → Controle de acesso de players
- `04-techniques-policies.sql` → Controle KAGE-only para técnicas

### 5️⃣ **Grants (05-grants/)** - Permissões
Define o que cada role pode fazer:
- `01-anon-grants.sql` → SELECT em tabelas públicas
- `02-authenticated-grants.sql` → SELECT/UPDATE em most tables, INSERT/UPDATE/DELETE gated by RLS

### 6️⃣ **Indexes (06-indexes/)** - Performance
Cria 23 índices estratégicos para queries rápidas

### 7️⃣ **Seeds (07-seeds/)** - Dados iniciais
Insere dados padrão:
- `01-roles.sql` → MEMBER, KAGE
- `02-ranks.sql` → C, B, A, S, SS, SSS
- `03-technique-types.sql` → NINJUTSU, TAIJUTSU, etc.
- `04-villages.sql` → (comentado, customize)
- `05-targets-escapes.sql` → Opções de alvo e escape

## 🔐 Modelo de Segurança

```
┌─────────────────┬──────────────────┬────────────────┐
│  Usuário        │  O que vê        │  O que pode    │
├─────────────────┼──────────────────┼────────────────┤
│ Anônimo         │ Roles, Villages  │ Nada           │
│                 │ Ranks, Characters│                │
├─────────────────┼──────────────────┼────────────────┤
│ MEMBER          │ Tudo (RLS)       │ Update own     │
│ (autenticado)   │ Filtrado por RLS │ player info    │
├─────────────────┼──────────────────┼────────────────┤
│ KAGE            │ Tudo (full       │ CRUD tudo      │
│ (admin)         │ access)          │ (All tables)   │
└─────────────────┴──────────────────┴────────────────┘
```

## 📊 Diagrama de Tabelas

```
🔑 CORE
├── roles
├── villages
├── ranks
└── technique_types

👤 PLAYERS
├── characters
└── players
    └── refs: roles, characters, villages

⚔️ TECHNIQUES
├── techniques (core)
│   └── refs: technique_types, ranks, players
├── jutsus | summonings (tipo)
├── technique_costs
├── technique_limits
├── technique_effects
│   └── technique_effect_values
├── technique_targets
│   └── targets
├── technique_escapes
│   └── escapes
└── technique_prices

📝 AUDIT
└── technique_updates (log de tudo)
```

## 🚀 Como Usar

### Opção 1: Arquivo Individual por Arquivo
```bash
# Execute cada arquivo nesta ordem:
1. 01-schema/*.sql
2. 02-functions/*.sql
3. 03-triggers/*.sql
4. 04-rls/*.sql
5. 05-grants/*.sql
6. 06-indexes/*.sql
7. 07-seeds/*.sql
```

### Opção 2: Tudo de Uma Vez
```sql
-- Cole todo o conteúdo de run_all_migrations.sql no Supabase SQL Editor
```

## ✅ Checklist de Implantação

- [ ] Criar novo projeto Supabase
- [ ] Executar migrations em ordem
- [ ] Verificar schema no Supabase UI
- [ ] Testar RLS policies
- [ ] Criar usuário KAGE na auth
- [ ] Testar acesso de usuário normal
- [ ] Documentar customizações (villages, etc)

## 🔧 Customizações Comuns

### Adicionar Nova Role
Edite `07-seeds/01-roles.sql`:
```sql
insert into public.roles (name, description)
values ('NOVA_ROLE', 'Descrição')
on conflict (name) do nothing;
```

### Adicionar Novo Rank
Edite `07-seeds/02-ranks.sql`:
```sql
insert into public.ranks (value, description)
values ('X', 'Descrição')
on conflict (value) do nothing;
```

### Adicionar Villages
Descomente e customize `07-seeds/04-villages.sql`

## 📈 Performance

- **23 índices** estrategicamente colocados
- **Queries otimizadas** para player lookups, técnicas por tipo/rank
- **RLS policies** escaláveis com functions SECURITY DEFINER
- **Audit trail separado** para não impactar tabelas principais

## 🔗 Relacionamentos Críticos

- `players.id` → `auth.users.id` (sem FK, apenas lookup)
- `techniques.rank_id` → Sempre obrigatório
- `techniques.technique_type_id` → Sempre obrigatório
- `technique_updates` → Tracks INSERT/UPDATE/DELETE automático

## 🆘 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Role não encontrada" | Rode `07-seeds/01-roles.sql` |
| "Permission denied" | Verifique RLS policies ativas |
| "FK constraint failed" | Rode seeds antes de dados |
| Queries lentas | Verifique índices em `06-indexes` |

## 📚 Documentação

- `README.md` - Guia completo e detalhado
- `STRUCTURE.md` - Este arquivo (visão geral rápida)
- `../1-arquitetura.md` - Design decisions
- `../2-banco-de-dados.md` - Conceitos de banco
- `../3-new-auth-flow.md` - Flow de autenticação

---

**Versão**: 2.0  
**Última atualização**: 2026-05-21  
**Status**: ✅ Pronto para produção
