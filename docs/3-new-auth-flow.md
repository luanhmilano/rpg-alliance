# Auth Flow Refatorado: Players Only

## Mudança Importante

A arquitetura de autenticação foi simplificada:

- ❌ **Removido**: Tabela `profiles` (denormalizada)
- ✅ **Mantém**: Tabela `players` (normalizada com FKs)
- ✅ **Usa**: `auth.users` do Supabase (separado)

## Novo Fluxo

### 1. Cadastro (Signup)

```
Usuário preenche formulário
  ↓
API /api/auth/signup:
  1. Cria user em auth.users (Supabase)
  2. Valida village, character, role no banco
  3. Cria registro em players com todos os dados
  4. **FALHA** se village/character não existirem
  ↓
Usuário é criado como MEMBER com approved=false
```

### 2. Login

```
Usuário faz login com email+password
  ↓
Supabase auth valida credenciais
  ↓
Application busca player no banco
  ↓
Se exists: user + player data → authorize
Se not exists: redirect para pending (aguarda admin criar player)
```

### 3. Aprovação

```
Admin atualiza: players.approved = true
  ↓
Usuário consegue acessar /dashboard
```

## Estrutura de Dados

### auth.users (Supabase Internal)
```
id (uuid)
email (text unique)
password_hash (text)
...outros campos do Supabase
```

### public.players
```
id (uuid) → FK para auth.users(id)
email (text unique)
phone (text)
role_id (uuid) → FK para roles(id)
character_id (uuid) → FK para characters(id)
village_id (uuid) → FK para villages(id)
approved (boolean) → controls access
```

### public.roles
```
id (uuid)
name (text) → 'KAGE', 'MEMBER'
```

### public.villages
```
id (uuid)
name (text)
```

### public.characters
```
id (uuid)
name (text)
avatar_url (text)
```

## Setup Inicial

### Passo 1: Criar dados de lookup

Execute no Supabase SQL Editor:

```sql
-- Roles
INSERT INTO public.roles (name) VALUES ('KAGE'), ('MEMBER')
ON CONFLICT (name) DO NOTHING;

-- Villages
INSERT INTO public.villages (name) VALUES 
  ('Vila da Folha'), 
  ('Vila da Areia'), 
  ('Vila da Nevoa'), 
  ('Vila da Nuvem'), 
  ('Vila da Pedra')
ON CONFLICT (name) DO NOTHING;

-- Characters
INSERT INTO public.characters (name, avatar_url) VALUES 
  ('Naruto Uzumaki', NULL), 
  ('Sasuke Uchiha', NULL), 
  ('Sakura Haruno', NULL),
  ('Kakashi Hatake', NULL), 
  ('Gaara', NULL), 
  ('Itachi Uchiha', NULL),
  ('Jiraiya', NULL), 
  ('Tsunade', NULL), 
  ('Shikamaru Nara', NULL),
  ('Hinata Hyuga', NULL)
ON CONFLICT (name) DO NOTHING;
```

### Passo 2: Testar signup

1. Abra http://localhost:3000/auth/sign-up
2. Preencha:
   - Email: teste@example.com
   - Senha: senha123456
   - Telefone: (11) 98765-4321
   - Vila: Vila da Folha
   - Personagem: Naruto Uzumaki
3. Clique "Concluir cadastro"

**Esperado**: Usuário aparece em `players` com `approved=false`

### Passo 3: Aprovar usuário (Admin)

Execute:
```sql
UPDATE public.players 
SET approved = true 
WHERE email = 'teste@example.com';
```

### Passo 4: Login

1. Abra http://localhost:3000/auth/login
2. Email: teste@example.com
3. Senha: senha123456
4. **Resultado**: Acesso ao dashboard (porque approved=true)

## Código Relevante

- **Autenticação**: `lib/access-control.ts` → Busca player via `auth.users.id`
- **Signup API**: `app/api/auth/signup/route.ts` → Valida e cria player
- **Guards de rota**: Usam `requireApprovedProfile()` que busca approved=true em players
- **Dados mockados**: `data/villages-mock.ts` e `data/characters-mock.ts` (frontend only)

## Segurança

- **RLS**: Desabilitado em `players` (segurança é por validação de autenticação no app)
- **Validation**: Todas as chamadas à API validam role, village, character
- **Email unique**: Banco garante unicidade de email em players
- **FK constraints**: role_id, village_id, character_id com restrict/set null

## Se Houver Erro

1. Verifique se villages, characters e roles existem:
```sql
SELECT * FROM public.villages;
SELECT * FROM public.characters;
SELECT * FROM public.roles;
```

2. Verifique se o player foi criado após signup:
```sql
SELECT * FROM public.players WHERE email = 'seu-email@example.com';
```

3. Verifique status de aprovação:
```sql
SELECT email, approved FROM public.players;
```
