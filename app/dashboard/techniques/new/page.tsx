import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireKageProfile } from "@/lib/access-control";
import { TechniqueForm } from "@/components/techniques/technique-form";
import { catalogsRepository } from "@/server/repositories/catalogs.repository";

export default function NewTechniquePage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">
          Carregando formulário de técnica...
        </div>
      }
    >
      <NewTechniqueContent />
    </Suspense>
  );
}

async function NewTechniqueContent() {
  await requireKageProfile();
  const [ranks, techniqueTypes, targets, escapes] = await Promise.all([
    catalogsRepository.listRankOptions(),
    catalogsRepository.listTechniqueTypeOptions(),
    catalogsRepository.listTargetOptions(),
    catalogsRepository.listEscapeOptions(),
  ]);

  if (!ranks.length || !techniqueTypes.length || !targets.length || !escapes.length) {
    return (
      <div className="flex-1 w-full flex flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Técnicas KAGE
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
          Técnicas KAGE
        </p>
        <h1 className="text-3xl font-bold">Nova técnica</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre a técnica com todos os dados de gameplay em um único fluxo.
          Você pode configurar custos, limites de uso, alvos permitidos, escapes,
          efeitos e preços por contexto para que a regra fique clara e consistente.
        </p>
        <p className="text-sm text-muted-foreground">
          Quanto mais detalhado o preenchimento, mais fácil fica para jogadores e
          narradores entenderem o comportamento da técnica durante as batalhas,
          compras e validações de ficha.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <TechniqueForm
            mode="create"
            rankOptions={ranks}
            techniqueTypeOptions={techniqueTypes}
            targetOptions={targets}
            escapeOptions={escapes}
          />
        </CardContent>
      </Card>
    </div>
  );
}
