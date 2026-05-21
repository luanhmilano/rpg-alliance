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

  const [techniqueResult, rankResult] = await Promise.all([
    supabase
      .from("techniques")
      .select("id,kind,name,rank_id,link,observations")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("ranks")
      .select("id,value")
      .order("value", { ascending: true }),
  ]);

  if (techniqueResult.error || !techniqueResult.data) {
    notFound();
  }

  if (rankResult.error) {
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
              Não foi possível carregar os ranks. Verifique as permissões da
              tabela <code>ranks</code> no Supabase e tente novamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const technique = techniqueResult.data;

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          KAGE Techniques
        </p>
        <h1 className="text-3xl font-bold">Editar técnica</h1>
        <p className="text-sm text-muted-foreground">
          Ajuste os dados principais da técnica. O histórico de alterações
          seguirá para o feed.
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
            initialValues={{
              kind: technique.kind,
              name: technique.name,
              rankId: technique.rank_id,
              link: technique.link ?? "",
              observations: technique.observations ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
