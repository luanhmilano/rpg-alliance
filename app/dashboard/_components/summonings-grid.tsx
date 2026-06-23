"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { AppRole } from "@/lib/access-control";
import type { SummoningModel } from "@/server/repositories/summonings.repository";

import { SummoningCard } from "./summoning-card";
import { SummoningSpecSheet } from "./summoning-spec-sheet";

export function SummoningsGrid({
  summonings,
  role,
}: {
  summonings: SummoningModel[];
  role: AppRole;
}) {
  const itemsPerPage = 10;
  const canEdit = role === "KAGE";

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSummoning, setSelectedSummoning] = useState<SummoningModel | null>(null);

  const totalPages = Math.max(1, Math.ceil(summonings.length / itemsPerPage));

  const visibleSummonings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return summonings.slice(start, start + itemsPerPage);
  }, [currentPage, summonings]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Invocações</h2>
        <p className="text-sm text-muted-foreground">
          Catálogo público de invocações, com acesso de leitura para membros aprovados.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>Todas as invocações visíveis para membros aprovados.</div>
          <div>
            {canEdit
              ? "Edição habilitada para KAGE."
              : "Somente usuários KAGE podem editar invocações."}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>Exibindo {visibleSummonings.length} de {summonings.length} invocações</div>
        <div>Página {currentPage} de {totalPages}</div>
      </div>

      {visibleSummonings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleSummonings.map((summoning) => (
            <SummoningCard
              key={summoning.id}
              summoning={summoning}
              onOpen={() => setSelectedSummoning(summoning)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma invocação encontrada.</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage <= 1}
        >
          Anterior
        </Button>
        <div className="text-sm text-muted-foreground">10 invocações por página</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          disabled={currentPage >= totalPages}
        >
          Próxima
        </Button>
      </div>

      {selectedSummoning && (
        <SummoningSpecSheet
          summoning={selectedSummoning}
          canEdit={canEdit}
          onClose={() => setSelectedSummoning(null)}
        />
      )}
    </div>
  );
}