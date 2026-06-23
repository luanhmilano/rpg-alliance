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
  ONE_TIME: "Uso único",
  ACTIVATION: "Ativação",
  PER_TURN: "Por turno",
};

const PRICE_CONTEXT_LABEL: Record<string, string> = {
  TECHNIQUE_PURCHASE: "Preço de compra",
  SUMMON_UNIT_PURCHASE: "Preço de compra",
  OTHER: "Outro",
};

const EFFECT_KIND_LABEL: Record<string, string> = {
  FIXED: "Fixo",
  BUFF: "Buff",
  BARRIER: "Barreira",
  SPECIAL: "Especial",
};

const EFFECT_OPERATION_LABEL: Record<string, string> = {
  SET: "Definir",
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
    return value.valueNumeric != null ? String(value.valueNumeric) : "Sem valor numérico";
  }

  if (value.valueType === "TEXT") {
    return value.valueText ?? "Sem texto";
  }

  return value.valueToken ?? "Sem token";
}

type SummoningPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SummoningDetailsPage({ params }: SummoningPageProps) {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Carregando detalhes da invocação...</div>}>
      <SummoningDetailsContent params={params} />
    </Suspense>
  );
}

async function SummoningDetailsContent({ params }: SummoningPageProps) {
  const profile = await requireApprovedProfile();
  const { id } = await params;
  const service = await buildTechniquesService();
  const summoning = await service.getById(id);

  if (!summoning || summoning.kind !== "SUMMONING") {
    notFound();
  }

  const createdLabel = new Date(summoning.createdAt).toLocaleString("pt-BR");
  const updatedLabel = new Date(summoning.updatedAt).toLocaleString("pt-BR");

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ficha da invocação</p>
          <h1 className="text-3xl md:text-4xl font-bold">{summoning.name}</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Voltar para o catálogo</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">{summoning.kind}</Badge>
              <Badge variant="secondary">{summoning.techniqueTypeName ?? summoning.techniqueTypeCode}</Badge>
              <Badge variant="outline">Rank {summoning.rankValue ?? "N/D"}</Badge>
            </div>
            <CardTitle className="text-xl">Especificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <section className="space-y-2">
              <h2 className="font-semibold">Custos de uso</h2>
              {summoning.costs.length ? (
                <div className="space-y-2">
                  {summoning.costs.map((cost, index) => (
                    <div key={`${cost.resource}-${cost.frequency}-${index}`} className="rounded-md border p-3">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Recurso:</span>{" "}
                        {COST_RESOURCE_LABEL[cost.resource] ?? cost.resource}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Quantidade:</span> {cost.amount}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Frequência:</span>{" "}
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
              <h2 className="font-semibold">Preços</h2>
              {summoning.prices.length ? (
                <div className="space-y-2">
                  {summoning.prices.map((price, index) => (
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
                <p className="text-muted-foreground">Nenhum preço cadastrado.</p>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Limites</h2>
              {summoning.limits ? (
                <div className="rounded-md border p-3 space-y-1">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Limite por turno:</span>{" "}
                    {summoning.limits.hasTurnLimit
                      ? `Sim (${summoning.limits.maxActiveTurns ?? "N/D"})`
                      : "Não"}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Limite por luta:</span>{" "}
                    {summoning.limits.hasFightUseLimit
                      ? `Sim (${summoning.limits.maxUsesPerFight ?? "N/D"})`
                      : "Não"}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Limite por card:</span>{" "}
                    {summoning.limits.hasCardUseLimit
                      ? `Sim (${summoning.limits.maxUsesPerCard ?? "N/D"})`
                      : "Não"}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum limite cadastrado.</p>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Atributos e efeitos</h2>
              {summoning.effects.length ? (
                <div className="space-y-1">
                  {summoning.effects.map((effect) => (
                    <p key={effect.id} className="text-sm text-muted-foreground font-mono">
                      {effect.affectedAttribute} | {formatEffectValue(effect.value)} | {EFFECT_KIND_LABEL[effect.effectKind] ?? effect.effectKind} | {EFFECT_OPERATION_LABEL[effect.operation] ?? effect.operation}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum atributo ou efeito cadastrado.</p>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Alvos</h2>
              {summoning.targets.length ? (
                <div className="flex flex-wrap gap-2">
                  {summoning.targets.map((target) => (
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
              {summoning.escapes.length ? (
                <div className="flex flex-wrap gap-2">
                  {summoning.escapes.map((escape) => (
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
              <h2 className="font-semibold">Observações</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {summoning.observations ?? "Nenhuma observação cadastrada."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Auditoria</h2>
              <p className="text-muted-foreground whitespace-pre-line">Criado em: {createdLabel}</p>
              <p className="text-muted-foreground whitespace-pre-line">Atualizado em: {updatedLabel}</p>
              <p className="text-muted-foreground break-all">Atualizado por: Sistema</p>
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Links e ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {summoning.link ? (
              <Button asChild className="w-full">
                <Link href={summoning.link} target="_blank" rel="noreferrer">
                  Abrir referência
                </Link>
              </Button>
            ) : (
              <Button className="w-full" disabled>
                Abrir referência
              </Button>
            )}
            {profile.role === "KAGE" && (
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/techniques/${summoning.id}/edit`}>Editar</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}