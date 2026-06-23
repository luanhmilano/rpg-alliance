import { Suspense } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireKageProfile } from "@/lib/access-control";
import { Button } from "@/components/ui/button";
import { JutsuForm } from "@/components/techniques/jutsu-form";
import { SummoningForm } from "@/components/techniques/summoning-form";
import { catalogsRepository } from "@/server/repositories/catalogs.repository";

type NewTechniquePageProps = {
  searchParams: Promise<{ kind?: string }>;
};

export default function NewTechniquePage({ searchParams }: NewTechniquePageProps) {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">
          Carregando formulário de técnica...
        </div>
      }
    >
      <NewTechniqueContent searchParams={searchParams} />
    </Suspense>
  );
}

async function NewTechniqueContent({ searchParams }: NewTechniquePageProps) {
  await requireKageProfile();
  const resolvedSearchParams = await searchParams;
  const requestedKind = resolvedSearchParams.kind === "SUMMONING" ? "SUMMONING" : resolvedSearchParams.kind === "JUTSU" ? "JUTSU" : null;
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

  if (!requestedKind) {
    return (
      <div className="flex-1 w-full flex flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Técnicas KAGE
          </p>
          <h1 className="text-3xl font-bold">Nova técnica</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Escolha primeiro o tipo de cadastro. Cada fluxo agora prepara o formulário com regras e linguagem próprias para jutsus e invocações.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Novo jutsu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use este fluxo para técnicas de combate, com foco em atributos como ATK e DEF, custos, escapes e efeitos complementares.
              </p>
              <Button asChild>
                <Link href="/dashboard/techniques/new?kind=JUTSU">Abrir formulário de jutsu</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nova invocação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use este fluxo para unidades invocadas, com os cinco atributos principais e preço de compra como parte do preenchimento principal.
              </p>
              <Button asChild>
                <Link href="/dashboard/techniques/new?kind=SUMMONING">Abrir formulário de invocação</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const title = requestedKind === "SUMMONING" ? "Nova invocação" : "Novo jutsu";
  const FormComponent = requestedKind === "SUMMONING" ? SummoningForm : JutsuForm;

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Técnicas KAGE
        </p>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre a técnica com todos os dados de gameplay em um fluxo específico para o tipo selecionado.
          Isso reduz ambiguidades entre jutsus e invocações e prepara a persistência correta dos atributos principais.
        </p>
        <p className="text-sm text-muted-foreground">
          Quanto mais detalhado o preenchimento, mais fácil fica para jogadores e narradores entenderem o comportamento da técnica durante batalhas, compras e validações de ficha.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do cadastro</CardTitle>
        </CardHeader>
        <CardContent>
          <FormComponent
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
