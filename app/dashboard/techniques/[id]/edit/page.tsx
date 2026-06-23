import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  COST_FREQUENCIES,
  COST_RESOURCES,
  EFFECT_KINDS,
  EFFECT_OPERATIONS,
  PRICE_CONTEXTS,
  TARGET_SCOPES,
} from "@/lib/modules/techniques/constants";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireKageProfile } from "@/lib/access-control";
import { JutsuForm } from "@/components/techniques/jutsu-form";
import { SummoningForm } from "@/components/techniques/summoning-form";
import { catalogsRepository } from "@/server/repositories/catalogs.repository";
import { buildTechniquesService } from "@/server/services/techniques.service";

type TechniquePageProps = {
  readonly params: Promise<{ id: string }>;
};

export default function EditTechniquePage({ params }: TechniquePageProps) {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">
          Loading technique editor...
        </div>
      }
    >
      <EditTechniqueContent params={params} />
    </Suspense>
  );
}

async function EditTechniqueContent({ params }: TechniquePageProps) {
  await requireKageProfile();
  const { id } = await params;
  const service = await buildTechniquesService();

  const [techniqueAggregate, ranks, techniqueTypes, targets, escapes] = await Promise.all([
    service.getById(id),
    catalogsRepository.listRankOptions(),
    catalogsRepository.listTechniqueTypeOptions(),
    catalogsRepository.listTargetOptions(),
    catalogsRepository.listEscapeOptions(),
  ]);

  if (!techniqueAggregate) {
    notFound();
  }

  if (!ranks.length || !techniqueTypes.length || !targets.length || !escapes.length) {
    return (
      <div className="flex-1 w-full flex flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            KAGE Techniques
          </p>
          <h1 className="text-3xl font-bold">Editar técnica</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Falha ao carregar editor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar catálogos da técnica. Verifique
              permissões de leitura de ranks, technique_types, targets e escapes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const technique = techniqueAggregate;
  const FormComponent = technique.kind === "SUMMONING" ? SummoningForm : JutsuForm;
  const title = technique.kind === "SUMMONING" ? "Editar invocação" : "Editar jutsu";

  const initialEffects = techniqueAggregate.effects.map((effect) => {
    if (effect.value?.valueType === "TEXT") {
      return {
        targetScope: effect.targetScope as (typeof TARGET_SCOPES)[number],
        affectedAttribute: effect.affectedAttribute,
        effectKind: effect.effectKind as (typeof EFFECT_KINDS)[number],
        operation: effect.operation as (typeof EFFECT_OPERATIONS)[number],
        valueType: "TEXT" as const,
        valueNumeric: "",
        valueText: effect.value.valueText,
        valueToken: "",
      };
    }

    if (effect.value?.valueType === "TOKEN") {
      return {
        targetScope: effect.targetScope as (typeof TARGET_SCOPES)[number],
        affectedAttribute: effect.affectedAttribute,
        effectKind: effect.effectKind as (typeof EFFECT_KINDS)[number],
        operation: effect.operation as (typeof EFFECT_OPERATIONS)[number],
        valueType: "TOKEN" as const,
        valueNumeric: "",
        valueText: "",
        valueToken: effect.value.valueToken,
      };
    }

    return {
      targetScope: effect.targetScope as (typeof TARGET_SCOPES)[number],
      affectedAttribute: effect.affectedAttribute,
      effectKind: effect.effectKind as (typeof EFFECT_KINDS)[number],
      operation: effect.operation as (typeof EFFECT_OPERATIONS)[number],
      valueType: "NUMERIC" as const,
      valueNumeric: typeof effect.value?.valueNumeric === "number" ? String(effect.value.valueNumeric) : "",
      valueText: "",
      valueToken: "",
    };
  });

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          KAGE Techniques
        </p>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Ajuste dados principais e blocos opcionais com um formulário específico para o tipo desta técnica.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{technique.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <FormComponent
            mode="edit"
            techniqueId={technique.id}
            rankOptions={ranks}
            techniqueTypeOptions={techniqueTypes}
            targetOptions={targets}
            escapeOptions={escapes}
            initialValues={{
              techniqueTypeId: technique.techniqueTypeId,
              name: technique.name,
              rankId: technique.rankId,
              link: technique.link ?? "",
              observations: technique.observations ?? "",
              costs: techniqueAggregate.costs.map((item) => ({
                resource: item.resource as (typeof COST_RESOURCES)[number],
                amount: String(item.amount),
                frequency: item.frequency as (typeof COST_FREQUENCIES)[number],
              })),
              prices: techniqueAggregate.prices.map((item) => ({
                priceContext: item.priceContext as (typeof PRICE_CONTEXTS)[number],
                amount: String(item.amount),
                notes: item.notes ?? "",
              })),
              limitsEnabled: Boolean(techniqueAggregate.limits),
              limits: {
                hasTurnLimit: techniqueAggregate.limits?.hasTurnLimit ?? false,
                maxActiveTurns:
                  techniqueAggregate.limits?.maxActiveTurns != null
                    ? String(techniqueAggregate.limits.maxActiveTurns)
                    : "",
                hasFightUseLimit: techniqueAggregate.limits?.hasFightUseLimit ?? false,
                maxUsesPerFight:
                  techniqueAggregate.limits?.maxUsesPerFight != null
                    ? String(techniqueAggregate.limits.maxUsesPerFight)
                    : "",
                hasCardUseLimit: techniqueAggregate.limits?.hasCardUseLimit ?? false,
                maxUsesPerCard:
                  techniqueAggregate.limits?.maxUsesPerCard != null
                    ? String(techniqueAggregate.limits.maxUsesPerCard)
                    : "",
              },
              effects: initialEffects,
              targetIds: techniqueAggregate.targetIds,
              escapeIds: techniqueAggregate.escapeIds,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
