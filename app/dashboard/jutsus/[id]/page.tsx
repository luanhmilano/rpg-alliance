import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireApprovedProfile } from "@/lib/access-control";
import { buildTechniquesService } from "@/server/services/techniques.service";

const COST_RESOURCE_LABEL: Record<string, string> = {
  CK: "CK",
  HP: "HP",
  AG: "AG",
};

const COST_FREQUENCY_LABEL: Record<string, string> = {
  ONE_TIME: "Uso unico",
  ACTIVATION: "Ativacao",
  PER_TURN: "Por turno",
};

const PRICE_CONTEXT_LABEL: Record<string, string> = {
  TECHNIQUE_PURCHASE: "Compra da tecnica",
  SUMMON_UNIT_PURCHASE: "Compra de invocacao",
  OTHER: "Outro",
};

const EFFECT_KIND_LABEL: Record<string, string> = {
  FIXED: "Fixo",
  BUFF: "Buff",
  BARRIER: "Barreira",
  SPECIAL: "Especial",
};

const EFFECT_OPERATION_LABEL: Record<string, string> = {
  SET: "Definido",
  ADD: "Somar",
  SUB: "Subtrair",
  MULTIPLY: "Multiplicar",
};

function formatEffectValue(
  value: {
    valueType: "NUMERIC" | "TEXT" | "TOKEN";
    valueNumeric: number | null;
    valueText: string | null;
    valueToken: string | null;
  } | null,
) {
  if (!value) {
    return "Sem valor";
  }

  if (value.valueType === "NUMERIC") {
    return value.valueNumeric != null ? String(value.valueNumeric) : "Sem valor numerico";
  }

  if (value.valueType === "TEXT") {
    return value.valueText ?? "Sem texto";
  }

  return value.valueToken ?? "Sem token";
}

type JutsuPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JutsuDetailsPage({ params }: JutsuPageProps) {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Carregando detalhes do jutsu...</div>}>
      <JutsuDetailsContent params={params} />
    </Suspense>
  );
}

async function JutsuDetailsContent({ params }: JutsuPageProps) {
  const profile = await requireApprovedProfile();
  const { id } = await params;
  const service = await buildTechniquesService();
  const jutsu = await service.getById(id);

  if (!jutsu || jutsu.kind !== "JUTSU") {
    notFound();
  }

  const createdLabel = new Date(jutsu.createdAt).toLocaleString("pt-BR");
  const updatedLabel = new Date(jutsu.updatedAt).toLocaleString("pt-BR");

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ficha do jutsu</p>
          <h1 className="text-3xl md:text-4xl font-bold">{jutsu.name}</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Voltar para o catalogo</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">{jutsu.kind}</Badge>
              <Badge variant="secondary">{jutsu.techniqueTypeName ?? jutsu.techniqueTypeCode}</Badge>
              <Badge variant="outline">Rank {jutsu.rankValue ?? "N/D"}</Badge>
            </div>
            <CardTitle className="text-xl">Especificacao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <section className="space-y-2">
              <h2 className="font-semibold">Custos</h2>
              {jutsu.costs.length ? (
                <div className="space-y-2">
                  {jutsu.costs.map((cost, index) => (
                    <div key={`${cost.resource}-${cost.frequency}-${index}`} className="rounded-md border p-3">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Recurso:</span>{" "}
                        {COST_RESOURCE_LABEL[cost.resource] ?? cost.resource}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Quantidade:</span> {cost.amount}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Frequencia:</span>{" "}
                        {COST_FREQUENCY_LABEL[cost.frequency] ?? cost.frequency}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum custo cadastrado.</p>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Precos</h2>
              {jutsu.prices.length ? (
                <div className="space-y-2">
                  {jutsu.prices.map((price, index) => (
                    <div key={`${price.priceContext}-${price.amount}-${index}`} className="rounded-md border p-3">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Contexto:</span>{" "}
                        {PRICE_CONTEXT_LABEL[price.priceContext] ?? price.priceContext}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Valor:</span> {price.amount}
                      </p>
                      <p className="text-muted-foreground whitespace-pre-line">
                        <span className="font-medium text-foreground">Notas:</span>{" "}
                        {price.notes ?? "Sem notas"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum preco cadastrado.</p>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Limites</h2>
              {jutsu.limits ? (
                <div className="rounded-md border p-3 space-y-1">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Limite por turno:</span>{" "}
                    {jutsu.limits.hasTurnLimit
                      ? `Sim (${jutsu.limits.maxActiveTurns ?? "N/D"})`
                      : "Nao"}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Limite por luta:</span>{" "}
                    {jutsu.limits.hasFightUseLimit
                      ? `Sim (${jutsu.limits.maxUsesPerFight ?? "N/D"})`
                      : "Nao"}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Limite por card:</span>{" "}
                    {jutsu.limits.hasCardUseLimit
                      ? `Sim (${jutsu.limits.maxUsesPerCard ?? "N/D"})`
                      : "Nao"}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum limite cadastrado.</p>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Efeitos</h2>
              {jutsu.effects.length ? (
                <div className="space-y-1">
                  {jutsu.effects.map((effect) => (
                    <p key={effect.id} className="text-sm text-muted-foreground font-mono">
                      {effect.affectedAttribute} | {formatEffectValue(effect.value)} | {EFFECT_KIND_LABEL[effect.effectKind] ?? effect.effectKind} | {EFFECT_OPERATION_LABEL[effect.operation] ?? effect.operation}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum efeito cadastrado.</p>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Alvos</h2>
              {jutsu.targets.length ? (
                <div className="flex flex-wrap gap-2">
                  {jutsu.targets.map((target) => (
                    <Badge key={target.id} variant="outline">
                      {target.description} ({target.code})
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum alvo cadastrado.</p>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Escapes</h2>
              {jutsu.escapes.length ? (
                <div className="flex flex-wrap gap-2">
                  {jutsu.escapes.map((escape) => (
                    <Badge key={escape.id} variant="outline">
                      {escape.description} ({escape.code})
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum escape cadastrado.</p>
              )}
            </section>

            <section className="space-y-1">
              <h2 className="font-semibold">Observacoes</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {jutsu.observations ?? "Nenhuma observacao cadastrada."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Referencias</h2>
              <p className="text-muted-foreground">Tipo: {jutsu.techniqueTypeName ?? jutsu.techniqueTypeCode}</p>
              <p className="text-muted-foreground">Rank: {jutsu.rankValue ?? "N/D"}</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Auditoria</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                Criado em: {createdLabel}
              </p>
              <p className="text-muted-foreground whitespace-pre-line">Atualizado em: {updatedLabel}</p>
              <p className="text-muted-foreground break-all">Atualizado por: Sistema</p>
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Links e Acoes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {jutsu.link ? (
              <Button asChild className="w-full">
                <Link href={jutsu.link} target="_blank" rel="noreferrer">
                  Abrir referencia
                </Link>
              </Button>
            ) : (
              <Button className="w-full" disabled>
                Abrir referencia
              </Button>
            )}
            {profile.role === "KAGE" && (
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/techniques/${jutsu.id}/edit`}>Editar</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
