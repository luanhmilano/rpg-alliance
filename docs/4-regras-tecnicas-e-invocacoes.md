# Regras de Tecnicas e Invocacoes

## Objetivo

Registrar explicitamente as regras de negocio de jutsus e invocacoes para que formulario, API, persistencia e exibicao usem a mesma fonte de verdade.

## Decisoes Atuais

- A entidade base continua sendo `techniques`, com `kind = JUTSU` ou `kind = SUMMONING`.
- Jutsus e invocacoes possuem formularios especializados no dashboard, mas continuam compartilhando o mesmo backend base.
- Os atributos exibidos na UI permanecem com as siglas `ATK`, `DEF`, `AG`, `HP` e `CK`.
- Nao foi criada uma string unica para atributos. A fonte de verdade continua sendo `technique_effects` + `technique_effect_values`.
- `Preco de Compra` e obrigatorio para jutsus e invocacoes.
- `Custo de Uso` e sempre persistido em `technique_costs`.
- `technique_costs.resource` aceita `CK`, `HP` e `AG`.

## Mapeamento UI -> Schema

| Conceito de negocio | UI | Schema/tabela |
| --- | --- | --- |
| Tipo principal | Jutsu ou Invocacao | `techniques.kind` |
| Tipo tecnico | Select do formulario | `techniques.technique_type_id` |
| Rank | Select do formulario | `techniques.rank_id` |
| Nome | Campo texto | `techniques.name` |
| Link de referencia | Campo URL | `techniques.link` |
| Observacoes | Textarea | `techniques.observations` |
| Custo de Uso | Bloco de custos | `technique_costs` |
| Preco de Compra | Bloco de precos | `technique_prices` |
| Limites de uso | Bloco de limites | `technique_limits` |
| Atributos principais | Bloco guiado do formulario | `technique_effects` + `technique_effect_values` |
| Efeitos especiais | Bloco complementar de efeitos | `technique_effects` + `technique_effect_values` |
| Alvos | Multi-selecao | `technique_targets` |
| Escapes | Multi-selecao | `technique_escapes` |

## Regras de Jutsu

- O formulario de jutsu filtra `technique_types` para tudo que nao for `SUMMONING`.
- O bloco de atributos principais deve ser usado para registrar atributos estruturados, principalmente `ATK`, `DEF`, `AG`, `HP` e `CK` quando fizerem parte da regra principal.
- Efeitos adicionais de texto, token ou comportamentos nao estruturados continuam no bloco complementar.
- Jutsus ofensivos devem ter `ATK` quando o dano fizer parte da regra principal.
- Jutsus defensivos devem ter `DEF` quando a defesa ou barreira fizer parte da regra principal.
- O preco obrigatorio de compra do jutsu e salvo com contexto `TECHNIQUE_PURCHASE`.

## Regras de Invocacao

- O formulario de invocacao filtra `technique_types` para `SUMMONING`.
- Invocacoes podem ter ate cinco atributos principais: `ATK`, `DEF`, `AG`, `HP` e `CK`.
- Todos os atributos principais da invocacao sao opcionais individualmente, mas devem ser preenchidos no bloco guiado quando existirem.
- Efeitos especiais fora dos atributos principais continuam sendo cadastrados no bloco complementar.
- O preco obrigatorio de compra da invocacao e salvo com contexto `SUMMON_UNIT_PURCHASE`.

## Custo de Uso

- Custo de uso nao e um preco monetario.
- Custo de uso pertence ao bloco `technique_costs`.
- Os recursos validos atualmente sao `CK`, `HP` e `AG`.
- O sistema aceita custos compostos, por exemplo `CK + HP`.
- A frequencia do custo continua sendo `ONE_TIME`, `ACTIVATION` ou `PER_TURN`.

## Atributos Principais

- O bloco guiado de atributos principais nao cria uma estrutura paralela no banco.
- Cada atributo preenchido no formulario e convertido para um efeito numerico persistido em `technique_effects`.
- O atributo vira `affected_attribute`.
- O valor numerico vira `technique_effect_values.value_numeric`.
- `target_scope`, `effect_kind` e `operation` continuam configuraveis para nao perder flexibilidade de regra.

## Leitura Publica

- O dashboard publico passa a expor duas secoes: jutsus e invocacoes.
- Jutsus continuam com tela propria em `/dashboard/jutsus/[id]`.
- Invocacoes passam a ter tela propria em `/dashboard/summonings/[id]`.
- A leitura detalhada deve mostrar custos, precos, limites, atributos/efeitos, alvos, escapes e observacoes.

## Impacto de Migration

- Foi adicionada migration incremental para permitir `AG` em `technique_costs.resource`.
- O schema base tambem foi atualizado para que novos ambientes ja nascam com essa regra.
- Qualquer expansao futura de recursos de custo deve atualizar, no minimo:
  - `lib/modules/techniques/constants.ts`
  - `lib/modules/techniques/schemas.ts`
  - `lib/db/supabase.types.ts`
  - SQL base em `lib/supabase/migrationsV2/01-schema/03-techniques-structure.sql`
  - migration incremental correspondente

## Pontos em Aberto

- Ainda nao ha regra backend dedicada para exigir atributos especificos por tipo de tecnica; a especializacao esta principalmente no formulario.
- O bloco complementar de efeitos continua aceitando composicoes genericas, entao regras muito avancadas ainda dependem de preenchimento cuidadoso.
- Se surgirem novos contextos de preco alem de compra, a regra deve ser documentada aqui antes de entrar no formulario.