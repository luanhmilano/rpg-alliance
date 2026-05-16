"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EFFECT_KINDS,
  EFFECT_OPERATIONS,
  EFFECT_VALUE_TYPES,
  TARGET_SCOPES,
  TECHNIQUE_KINDS,
} from "@/lib/modules/techniques/constants";

type RankOption = {
  id: string;
  value: string;
};

type TechniqueFormValues = {
  kind: (typeof TECHNIQUE_KINDS)[number];
  name: string;
  rankId: string;
  link: string;
  observations: string;
};

type TechniqueFormProps = {
  mode: "create" | "edit";
  rankOptions: RankOption[];
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
  kind: "JUTSU",
  name: "",
  rankId: "",
  link: "",
  observations: "",
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
  techniqueId,
  initialValues,
}: TechniqueFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<TechniqueFormValues>({
    ...defaultTechniqueValues,
    ...initialValues,
  });
  const [effect, setEffect] = useState<EffectFormValues>(defaultEffectValues);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const setValue = <K extends keyof TechniqueFormValues>(
    key: K,
    value: TechniqueFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const setEffectValue = <K extends keyof EffectFormValues>(
    key: K,
    value: EffectFormValues[K],
  ) => {
    setEffect((current) => ({ ...current, [key]: value }));
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
      const payload: Record<string, unknown> = {
        kind: values.kind,
        name: values.name.trim(),
        rankId: values.rankId,
        link: values.link.trim() || null,
        observations: values.observations.trim() || null,
      };

      if (mode === "create") {
        payload.costs = [];
        payload.limits = null;
        payload.targetIds = [];
        payload.escapeIds = [];
        payload.effects = [buildEffectPayload(effect)];
      }

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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kind">Tipo</Label>
              <select
                id="kind"
                value={values.kind}
                onChange={(event) =>
                  setValue(
                    "kind",
                    event.target.value as TechniqueFormValues["kind"],
                  )
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {TECHNIQUE_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
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

      {mode === "create" && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Primeiro efeito</h2>
              <p className="text-sm text-muted-foreground">
                A criação já nasce com um efeito mínimo para atender ao schema
                atual.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="targetScope">Escopo</Label>
                <select
                  id="targetScope"
                  value={effect.targetScope}
                  onChange={(event) =>
                    setEffectValue(
                      "targetScope",
                      event.target.value as EffectFormValues["targetScope"],
                    )
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
                <Label htmlFor="effectKind">Categoria</Label>
                <select
                  id="effectKind"
                  value={effect.effectKind}
                  onChange={(event) =>
                    setEffectValue(
                      "effectKind",
                      event.target.value as EffectFormValues["effectKind"],
                    )
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
                <Label htmlFor="affectedAttribute">Atributo afetado</Label>
                <Input
                  id="affectedAttribute"
                  value={effect.affectedAttribute}
                  onChange={(event) =>
                    setEffectValue("affectedAttribute", event.target.value)
                  }
                  placeholder="Ex.: chakra, speed, defense"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operation">Operação</Label>
                <select
                  id="operation"
                  value={effect.operation}
                  onChange={(event) =>
                    setEffectValue(
                      "operation",
                      event.target.value as EffectFormValues["operation"],
                    )
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
              <Label htmlFor="valueType">Tipo de valor</Label>
              <select
                id="valueType"
                value={effect.valueType}
                onChange={(event) =>
                  setEffectValue(
                    "valueType",
                    event.target.value as EffectFormValues["valueType"],
                  )
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
                <Label htmlFor="valueNumeric">Valor numérico</Label>
                <Input
                  id="valueNumeric"
                  type="number"
                  value={effect.valueNumeric}
                  onChange={(event) =>
                    setEffectValue("valueNumeric", event.target.value)
                  }
                  placeholder="10"
                />
              </div>
            )}

            {effect.valueType === "TEXT" && (
              <div className="space-y-2">
                <Label htmlFor="valueText">Valor texto</Label>
                <Input
                  id="valueText"
                  value={effect.valueText}
                  onChange={(event) =>
                    setEffectValue("valueText", event.target.value)
                  }
                  placeholder="Descrição do efeito"
                />
              </div>
            )}

            {effect.valueType === "TOKEN" && (
              <div className="space-y-2">
                <Label htmlFor="valueToken">Token</Label>
                <Input
                  id="valueToken"
                  value={effect.valueToken}
                  onChange={(event) =>
                    setEffectValue("valueToken", event.target.value)
                  }
                  placeholder="TOKEN_EXEMPLO"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
