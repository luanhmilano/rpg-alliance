"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  COST_FREQUENCIES,
  COST_RESOURCES,
  EFFECT_KINDS,
  EFFECT_OPERATIONS,
  EFFECT_VALUE_TYPES,
  PRICE_CONTEXTS,
  TARGET_SCOPES,
} from "@/lib/modules/techniques/constants";

type RankOption = {
  id: string;
  value: string;
};

type TechniqueTypeOption = {
  id: string;
  code: string;
  name: string;
};

type CatalogOption = {
  id: string;
  code: string;
  description: string;
};

type CostFormValues = {
  resource: (typeof COST_RESOURCES)[number];
  amount: string;
  frequency: (typeof COST_FREQUENCIES)[number];
};

type PriceFormValues = {
  priceContext: (typeof PRICE_CONTEXTS)[number];
  amount: string;
  notes: string;
};

type LimitsFormValues = {
  hasTurnLimit: boolean;
  maxActiveTurns: string;
  hasFightUseLimit: boolean;
  maxUsesPerFight: string;
  hasCardUseLimit: boolean;
  maxUsesPerCard: string;
};

type TechniqueFormValues = {
  techniqueTypeId: string;
  name: string;
  rankId: string;
  link: string;
  observations: string;
  costs: CostFormValues[];
  prices: PriceFormValues[];
  limitsEnabled: boolean;
  limits: LimitsFormValues;
  effects: EffectFormValues[];
  targetIds: string[];
  escapeIds: string[];
};

type TechniqueFormProps = {
  mode: "create" | "edit";
  rankOptions: RankOption[];
  techniqueTypeOptions: TechniqueTypeOption[];
  targetOptions: CatalogOption[];
  escapeOptions: CatalogOption[];
  techniqueId?: string;
  initialValues?: Partial<TechniqueFormValues>;
};

type EffectFormValues = {
  targetScope: (typeof TARGET_SCOPES)[number];
  affectedAttribute: string;
  effectKind: (typeof EFFECT_KINDS)[number];
  operation: (typeof EFFECT_OPERATIONS)[number];
  valueType: (typeof EFFECT_VALUE_TYPES)[number];
  valueNumeric: string;
  valueText: string;
  valueToken: string;
};

const defaultTechniqueValues: TechniqueFormValues = {
  techniqueTypeId: "",
  name: "",
  rankId: "",
  link: "",
  observations: "",
  costs: [],
  prices: [],
  limitsEnabled: false,
  limits: {
    hasTurnLimit: false,
    maxActiveTurns: "",
    hasFightUseLimit: false,
    maxUsesPerFight: "",
    hasCardUseLimit: false,
    maxUsesPerCard: "",
  },
  effects: [],
  targetIds: [],
  escapeIds: [],
};

const defaultEffectValues: EffectFormValues = {
  targetScope: "SELF",
  affectedAttribute: "",
  effectKind: "FIXED",
  operation: "SET",
  valueType: "NUMERIC",
  valueNumeric: "",
  valueText: "",
  valueToken: "",
};

export function TechniqueForm({
  mode,
  rankOptions,
  techniqueTypeOptions,
  targetOptions,
  escapeOptions,
  techniqueId,
  initialValues,
}: TechniqueFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<TechniqueFormValues>({
    ...defaultTechniqueValues,
    ...initialValues,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const setValue = <K extends keyof TechniqueFormValues>(
    key: K,
    value: TechniqueFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const setLimitsValue = <K extends keyof LimitsFormValues>(key: K, value: LimitsFormValues[K]) => {
    setValues((current) => ({
      ...current,
      limits: {
        ...current.limits,
        [key]: value,
      },
    }));
  };

  const addCost = () => {
    setValues((current) => ({
      ...current,
      costs: [...current.costs, { resource: "CK", amount: "", frequency: "ACTIVATION" }],
    }));
  };

  const updateCost = <K extends keyof CostFormValues>(index: number, key: K, value: CostFormValues[K]) => {
    setValues((current) => ({
      ...current,
      costs: current.costs.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const removeCost = (index: number) => {
    setValues((current) => ({
      ...current,
      costs: current.costs.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addPrice = () => {
    setValues((current) => ({
      ...current,
      prices: [...current.prices, { priceContext: "TECHNIQUE_PURCHASE", amount: "", notes: "" }],
    }));
  };

  const updatePrice = <K extends keyof PriceFormValues>(
    index: number,
    key: K,
    value: PriceFormValues[K],
  ) => {
    setValues((current) => ({
      ...current,
      prices: current.prices.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const removePrice = (index: number) => {
    setValues((current) => ({
      ...current,
      prices: current.prices.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addEffect = () => {
    setValues((current) => ({
      ...current,
      effects: [...current.effects, { ...defaultEffectValues }],
    }));
  };

  const updateEffect = <K extends keyof EffectFormValues>(
    index: number,
    key: K,
    value: EffectFormValues[K],
  ) => {
    setValues((current) => ({
      ...current,
      effects: current.effects.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const removeEffect = (index: number) => {
    setValues((current) => ({
      ...current,
      effects: current.effects.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const toggleSelection = (key: "targetIds" | "escapeIds", id: string) => {
    setValues((current) => {
      const selected = current[key];
      const next = selected.includes(id) ? selected.filter((itemId) => itemId !== id) : [...selected, id];
      return {
        ...current,
        [key]: next,
      };
    });
  };

  const summarizeSelection = (ids: string[], options: CatalogOption[], emptyLabel: string) => {
    if (ids.length === 0) {
      return emptyLabel;
    }

    const selectedLabels = options
      .filter((item) => ids.includes(item.id))
      .map((item) => item.description);

    if (selectedLabels.length <= 2) {
      return selectedLabels.join(", ");
    }

    return `${selectedLabels.length} selecionados`;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint =
        mode === "create"
          ? "/api/techniques"
          : `/api/techniques/${techniqueId}`;

      const selectedType = techniqueTypeOptions.find((item) => item.id === values.techniqueTypeId);
      const resolvedKind = selectedType?.code === "SUMMONING" ? "SUMMONING" : "JUTSU";

      const payload: Record<string, unknown> = {
        kind: resolvedKind,
        techniqueTypeId: values.techniqueTypeId,
        name: values.name.trim(),
        rankId: values.rankId,
        link: values.link.trim() || null,
        observations: values.observations.trim() || null,
        costs: values.costs.map((item) => ({
          resource: item.resource,
          amount: Number(item.amount),
          frequency: item.frequency,
        })),
        prices: values.prices.map((item) => ({
          priceContext: item.priceContext,
          amount: Number(item.amount),
          notes: item.notes.trim() || null,
        })),
        limits: values.limitsEnabled
          ? {
              hasTurnLimit: values.limits.hasTurnLimit,
              maxActiveTurns: values.limits.hasTurnLimit
                ? Number(values.limits.maxActiveTurns)
                : null,
              hasFightUseLimit: values.limits.hasFightUseLimit,
              maxUsesPerFight: values.limits.hasFightUseLimit
                ? Number(values.limits.maxUsesPerFight)
                : null,
              hasCardUseLimit: values.limits.hasCardUseLimit,
              maxUsesPerCard: values.limits.hasCardUseLimit
                ? Number(values.limits.maxUsesPerCard)
                : null,
            }
          : null,
        targetIds: values.targetIds,
        escapeIds: values.escapeIds,
        effects: values.effects.map((item) => buildEffectPayload(item)),
      };

      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseBody = (await response.json()) as
        | { ok: true; data: { technique?: { id: string } } }
        | { ok: false; error?: { message?: string } };

      if (!response.ok || !responseBody.ok) {
        throw new Error(
          responseBody.ok
            ? "Falha ao salvar técnica"
            : (responseBody.error?.message ?? "Falha ao salvar técnica"),
        );
      }

      if (mode === "create") {
        const nextTechniqueId = responseBody.data.technique?.id;

        if (nextTechniqueId) {
          router.replace(`/dashboard/techniques/${nextTechniqueId}/edit`);
          router.refresh();
          return;
        }
      }

      setSuccess("Técnica salva com sucesso.");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Falha ao salvar técnica",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="techniqueTypeId">Tipo tecnico</Label>
              <select
                id="techniqueTypeId"
                value={values.techniqueTypeId}
                required
                onChange={(event) =>
                  setValue("techniqueTypeId", event.target.value)
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione um tipo</option>
                {techniqueTypeOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rankId">Rank</Label>
              <select
                id="rankId"
                value={values.rankId}
                required
                onChange={(event) => setValue("rankId", event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione um rank</option>
                {rankOptions.map((rank) => (
                  <option key={rank.id} value={rank.id}>
                    {rank.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={values.name}
              required
              onChange={(event) => setValue("name", event.target.value)}
              placeholder="Ex.: Rasengan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link de referência</Label>
            <Input
              id="link"
              type="url"
              value={values.link}
              onChange={(event) => setValue("link", event.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <textarea
              id="observations"
              value={values.observations}
              onChange={(event) => setValue("observations", event.target.value)}
              className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Anotações públicas da técnica"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Custos</h2>
              <p className="text-sm text-muted-foreground">Adicione CK/HP conforme necessário.</p>
            </div>
            <Button type="button" variant="outline" onClick={addCost}>
              Adicionar custo
            </Button>
          </div>

          {values.costs.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum custo cadastrado.</p>
          )}

          {values.costs.map((item, index) => (
            <div key={`cost-${index}`} className="grid gap-3 md:grid-cols-4 items-end">
              <div className="space-y-2">
                <Label>Recurso</Label>
                <select
                  value={item.resource}
                  onChange={(event) =>
                    updateCost(index, "resource", event.target.value as CostFormValues["resource"])
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {COST_RESOURCES.map((resource) => (
                    <option key={resource} value={resource}>
                      {resource}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={item.amount}
                  onChange={(event) => updateCost(index, "amount", event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Frequencia</Label>
                <select
                  value={item.frequency}
                  onChange={(event) =>
                    updateCost(index, "frequency", event.target.value as CostFormValues["frequency"])
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {COST_FREQUENCIES.map((frequency) => (
                    <option key={frequency} value={frequency}>
                      {frequency}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="button" variant="destructive" onClick={() => removeCost(index)}>
                Remover
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Preços</h2>
              <p className="text-sm text-muted-foreground">Use contextos diferentes para técnica, corpo e outros.</p>
            </div>
            <Button type="button" variant="outline" onClick={addPrice}>
              Adicionar preco
            </Button>
          </div>

          {values.prices.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum preco cadastrado.</p>
          )}

          {values.prices.map((item, index) => (
            <div key={`price-${index}`} className="grid gap-3 md:grid-cols-4 items-end">
              <div className="space-y-2">
                <Label>Contexto</Label>
                <select
                  value={item.priceContext}
                  onChange={(event) =>
                    updatePrice(index, "priceContext", event.target.value as PriceFormValues["priceContext"])
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {PRICE_CONTEXTS.map((context) => (
                    <option key={context} value={context}>
                      {context}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={item.amount}
                  onChange={(event) => updatePrice(index, "amount", event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Input value={item.notes} onChange={(event) => updatePrice(index, "notes", event.target.value)} />
              </div>

              <Button type="button" variant="destructive" onClick={() => removePrice(index)}>
                Remover
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              id="limitsEnabled"
              type="checkbox"
              checked={values.limitsEnabled}
              onChange={(event) => setValue("limitsEnabled", event.target.checked)}
            />
            <Label htmlFor="limitsEnabled">Aplicar limites</Label>
          </div>

          {values.limitsEnabled && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="hasTurnLimit"
                      type="checkbox"
                      checked={values.limits.hasTurnLimit}
                      onChange={(event) => setLimitsValue("hasTurnLimit", event.target.checked)}
                    />
                    <Label htmlFor="hasTurnLimit">Limite por turno</Label>
                  </div>
                  {values.limits.hasTurnLimit && (
                    <Input
                      type="number"
                      min="1"
                      value={values.limits.maxActiveTurns}
                      onChange={(event) => setLimitsValue("maxActiveTurns", event.target.value)}
                      placeholder="Maximo de turnos"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="hasFightUseLimit"
                      type="checkbox"
                      checked={values.limits.hasFightUseLimit}
                      onChange={(event) => setLimitsValue("hasFightUseLimit", event.target.checked)}
                    />
                    <Label htmlFor="hasFightUseLimit">Limite por luta</Label>
                  </div>
                  {values.limits.hasFightUseLimit && (
                    <Input
                      type="number"
                      min="1"
                      value={values.limits.maxUsesPerFight}
                      onChange={(event) => setLimitsValue("maxUsesPerFight", event.target.value)}
                      placeholder="Maximo por luta"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    id="hasCardUseLimit"
                    type="checkbox"
                    checked={values.limits.hasCardUseLimit}
                    onChange={(event) => setLimitsValue("hasCardUseLimit", event.target.checked)}
                  />
                  <Label htmlFor="hasCardUseLimit">Limite por card</Label>
                </div>
                {values.limits.hasCardUseLimit && (
                  <Input
                    type="number"
                    min="1"
                    value={values.limits.maxUsesPerCard}
                    onChange={(event) => setLimitsValue("maxUsesPerCard", event.target.value)}
                    placeholder="Maximo por card"
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-lg font-semibold">Alvos</h2>
          {targetOptions.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum alvo disponivel no catalogo.</p>
          )}
          {targetOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-start text-left">
                  {summarizeSelection(values.targetIds, targetOptions, "Selecionar alvos")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[320px]">
                {targetOptions.map((item) => (
                  <DropdownMenuCheckboxItem
                    key={item.id}
                    checked={values.targetIds.includes(item.id)}
                    onCheckedChange={() => toggleSelection("targetIds", item.id)}
                  >
                    {item.description}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-lg font-semibold">Escapes</h2>
          {escapeOptions.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum escape disponivel no catalogo.</p>
          )}
          {escapeOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-start text-left">
                  {summarizeSelection(values.escapeIds, escapeOptions, "Selecionar escapes")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[320px]">
                {escapeOptions.map((item) => (
                  <DropdownMenuCheckboxItem
                    key={item.id}
                    checked={values.escapeIds.includes(item.id)}
                    onCheckedChange={() => toggleSelection("escapeIds", item.id)}
                  >
                    {item.description}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Efeitos</h2>
              <p className="text-sm text-muted-foreground">Agora o cadastro permite zero ou mais efeitos.</p>
            </div>
            <Button type="button" variant="outline" onClick={addEffect}>
              Adicionar efeito
            </Button>
          </div>

          {values.effects.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum efeito cadastrado.</p>
          )}

          {values.effects.map((effect, index) => (
            <div key={`effect-${index}`} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Efeito {index + 1}</h3>
                <Button type="button" size="sm" variant="destructive" onClick={() => removeEffect(index)}>
                  Remover
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Escopo</Label>
                  <select
                    value={effect.targetScope}
                    onChange={(event) =>
                      updateEffect(index, "targetScope", event.target.value as EffectFormValues["targetScope"])
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {TARGET_SCOPES.map((scope) => (
                      <option key={scope} value={scope}>
                        {scope}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <select
                    value={effect.effectKind}
                    onChange={(event) =>
                      updateEffect(index, "effectKind", event.target.value as EffectFormValues["effectKind"])
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {EFFECT_KINDS.map((kind) => (
                      <option key={kind} value={kind}>
                        {kind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Atributo</Label>
                  <Input
                    value={effect.affectedAttribute}
                    onChange={(event) => updateEffect(index, "affectedAttribute", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Operacao</Label>
                  <select
                    value={effect.operation}
                    onChange={(event) =>
                      updateEffect(index, "operation", event.target.value as EffectFormValues["operation"])
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {EFFECT_OPERATIONS.map((operation) => (
                      <option key={operation} value={operation}>
                        {operation}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de valor</Label>
                <select
                  value={effect.valueType}
                  onChange={(event) =>
                    updateEffect(index, "valueType", event.target.value as EffectFormValues["valueType"])
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {EFFECT_VALUE_TYPES.map((valueType) => (
                    <option key={valueType} value={valueType}>
                      {valueType}
                    </option>
                  ))}
                </select>
              </div>

              {effect.valueType === "NUMERIC" && (
                <div className="space-y-2">
                  <Label>Valor numerico</Label>
                  <Input
                    type="number"
                    value={effect.valueNumeric}
                    onChange={(event) => updateEffect(index, "valueNumeric", event.target.value)}
                  />
                </div>
              )}

              {effect.valueType === "TEXT" && (
                <div className="space-y-2">
                  <Label>Valor texto</Label>
                  <Input
                    value={effect.valueText}
                    onChange={(event) => updateEffect(index, "valueText", event.target.value)}
                  />
                </div>
              )}

              {effect.valueType === "TOKEN" && (
                <div className="space-y-2">
                  <Label>Token</Label>
                  <Input
                    value={effect.valueToken}
                    onChange={(event) => updateEffect(index, "valueToken", event.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Salvando..."
            : mode === "create"
              ? "Criar técnica"
              : "Salvar alterações"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Voltar
        </Button>
      </div>
    </form>
  );
}

function buildEffectPayload(effect: EffectFormValues) {
  const value =
    effect.valueType === "NUMERIC"
      ? {
          valueType: "NUMERIC",
          valueNumeric: Number(effect.valueNumeric),
          valueText: null,
          valueToken: null,
        }
      : effect.valueType === "TEXT"
        ? {
            valueType: "TEXT",
            valueNumeric: null,
            valueText: effect.valueText.trim(),
            valueToken: null,
          }
        : {
            valueType: "TOKEN",
            valueNumeric: null,
            valueText: null,
            valueToken: effect.valueToken.trim(),
          };

  return {
    targetScope: effect.targetScope,
    affectedAttribute: effect.affectedAttribute.trim(),
    effectKind: effect.effectKind,
    operation: effect.operation,
    value,
  };
}
