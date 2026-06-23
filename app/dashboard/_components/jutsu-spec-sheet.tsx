"use client";

import { ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { JutsuModel } from "@/lib/jutsus/query-parser";

type JutsuSpecSheetProps = {
  jutsu: JutsuModel;
  onClose: () => void;
  canEdit?: boolean;
};

export function JutsuSpecSheet({ jutsu, onClose, canEdit = false }: JutsuSpecSheetProps) {
  const router = useRouter();

  function navigateToFullPage(href: string) {
    onClose();
    router.push(href);
  }
  const createdLabel = new Date(jutsu.createdAt).toLocaleString("pt-BR");
  const updatedLabel = new Date(jutsu.updatedAt).toLocaleString("pt-BR");

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-3 md:p-8 overflow-y-auto">
      <div className="mx-auto max-w-5xl">
        <Card className="border-2 border-primary/20">
          <CardHeader className="border-b bg-card">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Especificacoes do jutsu
                </p>
                <CardTitle className="text-3xl md:text-4xl">{jutsu.name}</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">{jutsu.kind}</Badge>
                  <Badge variant="secondary">{jutsu.techniqueTypeName ?? jutsu.techniqueTypeCode}</Badge>
                  <Badge variant="outline">Rank {jutsu.rankValue ?? "N/D"}</Badge>
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
                <p className="text-sm font-semibold break-all">{jutsu.kind}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="text-sm font-semibold break-all">{jutsu.techniqueTypeName ?? jutsu.techniqueTypeCode}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Rank</p>
                <p className="text-sm font-semibold break-all">{jutsu.rankValue ?? "N/D"}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Atualizado por</p>
                <p className="text-sm font-semibold break-all">{jutsu.updatedBy ?? "Sistema"}</p>
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold">Identificacao</h3>
              <div className="rounded-md border p-4 space-y-2">
                <p className="text-sm text-muted-foreground break-all">
                  <span className="font-semibold text-foreground">ID do jutsu:</span> {jutsu.id}
                </p>
                <p className="text-sm text-muted-foreground break-all">
                  <span className="font-semibold text-foreground">Tipo tecnico (codigo):</span>{" "}
                  {jutsu.techniqueTypeCode}
                </p>
                <p className="text-sm text-muted-foreground break-all">
                  <span className="font-semibold text-foreground">Tipo tecnico (nome):</span>{" "}
                  {jutsu.techniqueTypeName ?? "Nao informado"}
                </p>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold">Observacoes</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {jutsu.observations ?? "Nenhuma observacao cadastrada."}
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
              <h3 className="text-sm font-semibold mb-1">Referencia</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Abra o link externo de referencia ou visite a pagina completa com todos os detalhes.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {jutsu.link ? (
                  <Button variant="default" className="gap-2" asChild>
                    <a href={jutsu.link} target="_blank" rel="noreferrer">
                      Abrir referencia
                      <ExternalLink size={14} />
                    </a>
                  </Button>
                ) : (
                  <Button variant="default" className="gap-2" disabled>
                    Abrir referencia
                    <ExternalLink size={14} />
                  </Button>
                )}
                <Button variant="secondary" onClick={() => navigateToFullPage(`/dashboard/jutsus/${jutsu.id}`)}>
                  Abrir pagina completa
                </Button>
                {canEdit && (
                  <Button variant="outline" onClick={() => navigateToFullPage(`/dashboard/techniques/${jutsu.id}/edit`)}>
                    Editar jutsu
                  </Button>
                )}
              </div>
              {!canEdit && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Edicao disponivel apenas para usuarios KAGE.
                </p>
              )}
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
