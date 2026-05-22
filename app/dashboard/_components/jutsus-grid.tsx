"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { JutsuCard } from "./jutsu-card";
import { JutsuSpecSheet } from "./jutsu-spec-sheet";
import type { AppRole } from "@/lib/access-control";
import type { JutsuModel } from "@/lib/jutsus/query-parser";

export function JutsusGrid({
  jutsus,
  role,
}: {
  jutsus: JutsuModel[];
  role: AppRole;
}) {
  const itemsPerPage = 10;
  const canEdit = role === "KAGE";

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJutsu, setSelectedJutsu] = useState<JutsuModel | null>(null);

  const totalPages = Math.max(1, Math.ceil(jutsus.length / itemsPerPage));

  const visibleJutsus = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return jutsus.slice(start, start + itemsPerPage);
  }, [currentPage, jutsus]);

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>Todos os jutsus visiveis para membros aprovados.</div>
          <div>
            {canEdit
              ? "Edicao habilitada para KAGE."
              : "Somente usuarios KAGE podem editar jutsus."}
          </div>
        </div>
      </div>

      {/* Contadores */}
      <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>Exibindo {visibleJutsus.length} de {jutsus.length} jutsus</div>
        <div>Pagina {currentPage} de {totalPages}</div>
      </div>

      {/* Grade de Cards */}
      {visibleJutsus.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleJutsus.map((jutsu) => (
            <JutsuCard
              key={jutsu.id}
              jutsu={jutsu}
              onOpen={() => setSelectedJutsu(jutsu)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum jutsu encontrado.</p>
        </div>
      )}

      {/* Paginação */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
        >
          Anterior
        </Button>
        <div className="text-sm text-muted-foreground">10 jutsus por página</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages}
        >
          Proxima
        </Button>
      </div>

      {/* Renderização do Modal de Detalhes */}
      {selectedJutsu && (
        <JutsuSpecSheet 
          jutsu={selectedJutsu} 
          canEdit={canEdit}
          onClose={() => setSelectedJutsu(null)} 
        />
      )}
    </div>
  );
}