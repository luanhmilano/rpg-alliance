# 📋 QUICK_REFERENCE.md - Consulta Rápida

## 🎯 O Que Você Precisa Saber em 1 Minuto

```
migrationsV2 é uma estrutura reorganizada de migrations SQL para Supabase.

Ao invés de:  6 arquivos grandes e confusos
Agora tem:    22 arquivos focados + 8 guias

Setup:        Cole run_all_migrations.sql → Execute (15 segundos)
Aprendizado:  Leia INDEX.md → OVERVIEW_PT.md → README.md (1 hora)
Status:       ✅ Pronto para produção
```

---

## 🚀 Setup Rápido (Copie e Cole)

```sql
-- 1. Abra Supabase → SQL Editor
-- 2. Cole TODO conteúdo de: run_all_migrations.sql
-- 3. Click Execute
-- 4. Pronto! ✅
```

**Tempo:** 15 segundos  
**Resultado:** 19 tabelas + 6 functions + 8 triggers + 45+ policies + 23 índices

---

## 📚 Qual Documento Ler?

| Preciso... | Leia... | Tempo |
|-----------|---------|-------|
| Começar agora | run_all_migrations.sql | 15s |
| Entender estrutura | INDEX.md | 3m |
| Resumo português | OVERVIEW_PT.md | 5m |
| Visão de 30k pés | STRUCTURE.md | 10m |
| Ordem de execução | EXECUTION_ORDER.md | 10m |
| Tudo detalhado | README.md | 30m |
| Migrar de V1 | MIGRATION_GUIDE.md | 15m |
| Verificar tudo | CHECKLIST.md | 5m |
| Visual rápido | VISUAL_OVERVIEW.txt | 2m |

---

## 🗂️ Estrutura em Uma Linha

```
01-schema/ (19 tabelas) → 02-functions/ (6 funções) → 03-triggers/ (8 triggers)
→ 04-rls/ (45+ policies) → 05-grants/ (permissões) → 06-indexes/ (23 índices)
→ 07-seeds/ (30+ dados)
```

---

## 📊 Tabelas Criadas

| Grupo | Tabelas | Total |
|-------|---------|-------|
| Core | roles, villages, ranks, technique_types | 4 |
| Players | characters, players | 2 |
| Techniques | techniques, jutsus, summonings, costs, limits, effects, effect_values, targets, technique_targets, escapes, technique_escapes, prices | 12 |
| Audit | technique_updates | 1 |

**Total: 19 tabelas**

---

## 🔐 Modelo de Segurança

```
Anônimo:      Ver roles, villages, ranks, characters
MEMBER:       Ver tudo, atualizar dados próprios
KAGE:         Ver/criar/editar/deletar tudo
```

---

## 🎯 3 Formas de Usar

### 1️⃣ RÁPIDA (15 seg)
```
Cole run_all_migrations.sql → Execute
```

### 2️⃣ PASSOS (15 seg + controle)
```
Execute cada pasta em ordem:
01-schema/ → 02-functions/ → 03-triggers/ → 04-rls/ 
→ 05-grants/ → 06-indexes/ → 07-seeds/
```

### 3️⃣ APRENDIZADO (1h)
```
INDEX.md (3m) → OVERVIEW_PT.md (5m) → STRUCTURE.md (10m) 
→ README.md (30m) → Explore SQLs (20m)
```

---

## ❓ FAQ Rápido

**P: Quantas tabelas são criadas?**  
R: 19 tabelas com relacionamentos e constraints

**P: Tempo de setup?**  
R: 15 segundos

**P: Preciso saber SQL?**  
R: Não! Só copie e cole

**P: É seguro rodar?**  
R: Sim! Idempotent - seguro rodar 2x

**P: Qual é a melhor forma de começar?**  
R: Cole run_all_migrations.sql e execute (OPÇÃO 1)

**P: Depois de rodar, o que verifico?**  
R: Veja CHECKLIST.md para verificação

**P: Posso customizar?**  
R: Sim! Veja "Customization" em README.md

**P: Para migrar de V1?**  
R: Leia MIGRATION_GUIDE.md

---

## ✅ Verificação Pós-Setup

```sql
-- Tabelas criadas?
SELECT count(*) FROM information_schema.tables 
WHERE table_schema='public';
-- Resultado esperado: 19

-- RLS ativado?
SELECT tablename FROM pg_tables 
WHERE schemaname='public' AND rowsecurity='f';
-- Resultado esperado: (vazio = RLS em todas)

-- Seeds carregados?
SELECT * FROM public.roles;
-- Resultado esperado: MEMBER, KAGE
```

---

## 📂 Arquivos Mais Importantes

| Arquivo | Por quê | Quando |
|---------|---------|--------|
| run_all_migrations.sql | Tudo junto | 1ª vez |
| INDEX.md | Navegação | Primeira leitura |
| OVERVIEW_PT.md | Português | Se é português |
| README.md | Referência | Quando tiver dúvida |
| STRUCTURE.md | Visão geral | Entendimento inicial |

---

## 🆘 Problemas Comuns

| Erro | Solução |
|------|---------|
| "table does not exist" | Rode 01-schema/ |
| "function does not exist" | Rode 02-functions/ |
| "Permission denied" | Rode 04-rls/ + 05-grants/ |
| Queries lentas | Rode 06-indexes/ |

---

## 📞 Documentação Map

```
Quer começar?          → run_all_migrations.sql
Quer navegar?          → INDEX.md
Quer português?        → OVERVIEW_PT.md
Quer entender?         → STRUCTURE.md, README.md
Quer passo a passo?    → EXECUTION_ORDER.md
Quer migrar V1→V2?    → MIGRATION_GUIDE.md
Quer verificar?        → CHECKLIST.md
Quer visual?           → VISUAL_OVERVIEW.txt
```

---

## 🎨 Customizações Comuns

### Adicionar Aldeia
```sql
-- Edite: 07-seeds/04-villages.sql
INSERT INTO villages (name, description)
VALUES ('Minha Aldeia', 'Descrição');
```

### Adicionar Role
```sql
-- Edite: 07-seeds/01-roles.sql
INSERT INTO roles (name, description)
VALUES ('NOVA_ROLE', 'Descrição');
```

### Modificar Permissões
```sql
-- Edite: 04-rls/04-techniques-policies.sql
-- Modifique as policies conforme necessário
```

---

## ⏱️ Timeline

| Ação | Tempo |
|------|-------|
| Setup (copiar/colar) | 1 minuto |
| Setup (executar) | 15 segundos |
| Verificação | 5 minutos |
| Aprendizado inicial | 30 minutos |
| Dominar completamente | 1-2 horas |
| Produção | Depois que testar |

---

## 🚀 Visão de 10.000 pés

```
ANTES (V1):
├── 6 arquivos confusos
├── Schema espalhado
├── RLS misturado com functions
├── Sem documentação clara
└── Difícil entender

DEPOIS (V2):
├── 22 arquivos focados
├── Schema organizado (4 arquivos)
├── 7 camadas bem separadas
├── 8 guias de documentação
└── Fácil entender e manter
```

---

## 💾 Dados de Referência

**Tabelas:** 19  
**Functions:** 6  
**Triggers:** 8  
**Policies:** 45+  
**Índices:** 23  
**Seeds:** 30+  
**Documentação:** 8 arquivos  

---

## 🎯 Seu Caminho Para Sucesso

```
1. Leia este arquivo (2 min)
2. Abra run_all_migrations.sql (1 min)
3. Execute em Supabase (15 seg)
4. Leia INDEX.md (3 min)
5. Explore conforme necessário
```

---

## 🏆 O Que Você Ganhou

✅ Estrutura modular  
✅ Documentação extensiva  
✅ Setup em 15 segundos  
✅ Pronto para produção  
✅ Fácil de customizar  
✅ Fácil de entender  
✅ Fácil de manter  
✅ Pronto para migração  

---

**Versão:** 2.0  
**Data:** 2026-05-21  
**Status:** ✅ PRONTO

**Próximo passo:** Abra `run_all_migrations.sql` ou `INDEX.md`
