import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireKageProfile } from "@/lib/access-control";
import { createClient } from "@/lib/supabase/server";
import { TechniqueForm } from "@/components/techniques/technique-form";

export default function NewTechniquePage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">
          Loading technique form...
        </div>
      }
    >
      <NewTechniqueContent />
    </Suspense>
  );
}

async function NewTechniqueContent() {
  await requireKageProfile();
  const supabase = await createClient();

  const [rankResult, typeResult, targetResult, escapeResult] = await Promise.all([
    supabase.from("ranks").select("id,value").order("value", { ascending: true }),
    supabase.from("technique_types").select("id,code,name").order("name", { ascending: true }),
    supabase.from("targets").select("id,code,description").order("code", { ascending: true }),
    supabase.from("escapes").select("id,code,description").order("code", { ascending: true }),
  ]);

  if (rankResult.error || typeResult.error || targetResult.error || escapeResult.error) {
    return (
      <div className="flex-1 w-full flex flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            KAGE Techniques
          </p>
          <h1 className="text-3xl font-bold">Nova técnica</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Falha ao carregar formulário</CardTitle>
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

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          KAGE Techniques
        </p>
        <h1 className="text-3xl font-bold">Nova técnica</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre a técnica com campos opcionais para custos, limites, alvos,
          escapes, efeitos e preços por contexto.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <TechniqueForm
            mode="create"
            rankOptions={rankResult.data ?? []}
            techniqueTypeOptions={typeResult.data ?? []}
            targetOptions={targetResult.data ?? []}
            escapeOptions={escapeResult.data ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
