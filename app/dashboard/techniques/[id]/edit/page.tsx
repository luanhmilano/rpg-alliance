import { Suspense } from "react";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireKageProfile } from "@/lib/access-control";
import { TechniqueForm } from "@/components/techniques/technique-form";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();

  const [techniqueResult, rankResult, typeResult, targetResult, escapeResult] = await Promise.all([
    supabase
      .from("techniques")
      .select("id,kind,technique_type_id,name,rank_id,link,observations")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("ranks")
      .select("id,value")
      .order("value", { ascending: true }),
    supabase
      .from("technique_types")
      .select("id,code,name")
      .order("name", { ascending: true }),
    supabase
      .from("targets")
      .select("id,code,description")
      .order("code", { ascending: true }),
    supabase
      .from("escapes")
      .select("id,code,description")
      .order("code", { ascending: true }),
  ]);

  if (techniqueResult.error || !techniqueResult.data) {
    notFound();
  }

  if (rankResult.error || typeResult.error || targetResult.error || escapeResult.error) {
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

  const technique = techniqueResult.data;

  const [costsResult, pricesResult, limitsResult, effectsResult, valuesResult, targetsResult, escapesResult] =
    await Promise.all([
      supabase.from("technique_costs").select("resource,amount,frequency").eq("technique_id", id),
      supabase
        .from("technique_prices")
        .select("price_context,amount,notes")
        .eq("technique_id", id)
        .order("created_at", { ascending: true }),
      supabase.from("technique_limits").select("*").eq("technique_id", id).maybeSingle(),
      supabase
        .from("technique_effects")
        .select("id,target_scope,affected_attribute,effect_kind,operation")
        .eq("technique_id", id)
        .order("execution_order", { ascending: true, nullsFirst: false }),
      supabase.from("technique_effect_values").select("*"),
      supabase.from("technique_targets").select("target_id").eq("technique_id", id),
      supabase.from("technique_escapes").select("escape_id").eq("technique_id", id),
    ]);

  if (
    costsResult.error ||
    pricesResult.error ||
    limitsResult.error ||
    effectsResult.error ||
    valuesResult.error ||
    targetsResult.error ||
    escapesResult.error
  ) {
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
            <CardTitle>Falha ao carregar dados da técnica</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Não foi possível montar os dados relacionados para edição.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const effectValuesMap = new Map(
    (valuesResult.data ?? []).map((item) => [item.effect_id, item]),
  );

  const initialEffects = (effectsResult.data ?? []).map((effect) => {
    const value = effectValuesMap.get(effect.id);

    if (value?.value_type === "TEXT") {
      return {
        targetScope: effect.target_scope,
        affectedAttribute: effect.affected_attribute,
        effectKind: effect.effect_kind,
        operation: effect.operation,
        valueType: "TEXT" as const,
        valueNumeric: "",
        valueText: value.value_text ?? "",
        valueToken: "",
      };
    }

    if (value?.value_type === "TOKEN") {
      return {
        targetScope: effect.target_scope,
        affectedAttribute: effect.affected_attribute,
        effectKind: effect.effect_kind,
        operation: effect.operation,
        valueType: "TOKEN" as const,
        valueNumeric: "",
        valueText: "",
        valueToken: value.value_token ?? "",
      };
    }

    return {
      targetScope: effect.target_scope,
      affectedAttribute: effect.affected_attribute,
      effectKind: effect.effect_kind,
      operation: effect.operation,
      valueType: "NUMERIC" as const,
      valueNumeric: value?.value_numeric != null ? String(value.value_numeric) : "",
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
        <h1 className="text-3xl font-bold">Editar técnica</h1>
        <p className="text-sm text-muted-foreground">
          Ajuste dados principais e blocos opcionais sem perder compatibilidade
          com técnicas legadas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{technique.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <TechniqueForm
            mode="edit"
            techniqueId={technique.id}
            rankOptions={rankResult.data ?? []}
            techniqueTypeOptions={typeResult.data ?? []}
            targetOptions={targetResult.data ?? []}
            escapeOptions={escapeResult.data ?? []}
            initialValues={{
              techniqueTypeId: technique.technique_type_id,
              name: technique.name,
              rankId: technique.rank_id,
              link: technique.link ?? "",
              observations: technique.observations ?? "",
              costs: (costsResult.data ?? []).map((item) => ({
                resource: item.resource,
                amount: String(item.amount),
                frequency: item.frequency,
              })),
              prices: (pricesResult.data ?? []).map((item) => ({
                priceContext: item.price_context,
                amount: String(item.amount),
                notes: item.notes ?? "",
              })),
              limitsEnabled: Boolean(limitsResult.data),
              limits: {
                hasTurnLimit: limitsResult.data?.has_turn_limit ?? false,
                maxActiveTurns:
                  limitsResult.data?.max_active_turns != null
                    ? String(limitsResult.data.max_active_turns)
                    : "",
                hasFightUseLimit: limitsResult.data?.has_fight_use_limit ?? false,
                maxUsesPerFight:
                  limitsResult.data?.max_uses_per_fight != null
                    ? String(limitsResult.data.max_uses_per_fight)
                    : "",
                hasCardUseLimit: limitsResult.data?.has_card_use_limit ?? false,
                maxUsesPerCard:
                  limitsResult.data?.max_uses_per_card != null
                    ? String(limitsResult.data.max_uses_per_card)
                    : "",
              },
              effects: initialEffects,
              targetIds: (targetsResult.data ?? []).map((item) => item.target_id),
              escapeIds: (escapesResult.data ?? []).map((item) => item.escape_id),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
