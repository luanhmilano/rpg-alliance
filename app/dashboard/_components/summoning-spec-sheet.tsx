"use client";

import { ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SummoningModel } from "@/server/repositories/summonings.repository";

type SummoningSpecSheetProps = {
  summoning: SummoningModel;
  onClose: () => void;
  canEdit?: boolean;
};

export function SummoningSpecSheet({ summoning, onClose, canEdit = false }: SummoningSpecSheetProps) {
  const router = useRouter();

  function navigateToFullPage(href: string) {
    onClose();
    router.push(href);
  }
  const createdLabel = new Date(summoning.createdAt).toLocaleString("pt-BR");
  const updatedLabel = new Date(summoning.updatedAt).toLocaleString("pt-BR");

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-3 md:p-8 overflow-y-auto">
      <div className="mx-auto max-w-5xl">
        <Card className="border-2 border-primary/20">
          <CardHeader className="border-b bg-card">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Especificações da invocação
                </p>
                <CardTitle className="text-3xl md:text-4xl">{summoning.name}</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">{summoning.kind}</Badge>
                  <Badge variant="secondary">{summoning.techniqueTypeName ?? summoning.techniqueTypeCode}</Badge>
                  <Badge variant="outline">Rank {summoning.rankValue ?? "N/D"}</Badge>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={onClose} aria-label="Fechar detalhes">
                <X size={16} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Categoria</p>
                <p className="text-sm font-semibold break-all">{summoning.kind}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="text-sm font-semibold break-all">{summoning.techniqueTypeName ?? summoning.techniqueTypeCode}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Rank</p>
                <p className="text-sm font-semibold break-all">{summoning.rankValue ?? "N/D"}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Atualizado por</p>
                <p className="text-sm font-semibold break-all">{summoning.updatedBy ?? "Sistema"}</p>
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold">Observações</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {summoning.observations ?? "Nenhuma observação cadastrada."}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold">Registros de tempo</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                Criado em: {createdLabel}
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                Atualizado em: {updatedLabel}
              </p>
            </section>

            <section className="rounded-md border border-accent/30 bg-accent/10 p-4">
              <h3 className="text-sm font-semibold mb-1">Referência</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Abra o link externo de referência ou visite a página completa com custos, preços, atributos e efeitos.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {summoning.link ? (
                  <Button variant="default" className="gap-2" asChild>
                    <a href={summoning.link} target="_blank" rel="noreferrer">
                      Abrir referência
                      <ExternalLink size={14} />
                    </a>
                  </Button>
                ) : (
                  <Button variant="default" className="gap-2" disabled>
                    Abrir referência
                    <ExternalLink size={14} />
                  </Button>
                )}
                <Button variant="secondary" onClick={() => navigateToFullPage(`/dashboard/summonings/${summoning.id}`)}>
                  Abrir página completa
                </Button>
                {canEdit && (
                  <Button variant="outline" onClick={() => navigateToFullPage(`/dashboard/techniques/${summoning.id}/edit`)}>
                    Editar invocação
                  </Button>
                )}
              </div>
              {!canEdit && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Edição disponível apenas para usuários KAGE.
                </p>
              )}
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}