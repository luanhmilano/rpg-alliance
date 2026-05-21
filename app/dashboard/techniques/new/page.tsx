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

  const { data: rankOptions, error } = await supabase
    .from("ranks")
    .select("id,value")
    .order("value", { ascending: true });

  if (error) {
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
              Não foi possível carregar os ranks. Verifique as permissões da
              tabela <code>ranks</code> no Supabase e tente novamente.
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
          Crie a base da técnica e o primeiro efeito para alimentar o audit
          trail.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <TechniqueForm mode="create" rankOptions={rankOptions ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
