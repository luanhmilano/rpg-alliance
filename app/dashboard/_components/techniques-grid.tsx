"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { JutsuCard } from "./jutsu-card";
import { JutsuSpecSheet } from "./jutsu-spec-sheet";
import { SummoningCard } from "./summoning-card";
import { SummoningSpecSheet } from "./summoning-spec-sheet";
import type { AppRole } from "@/lib/access-control";
import type { JutsuModel } from "@/lib/jutsus/query-parser";
import type { SummoningModel } from "@/server/repositories/summonings.repository";

type TechniqueType = "ALL" | "JUTSU" | "SUMMONING";
type RankFilter = "ALL" | "C" | "B" | "A" | "S" | "SS" | "SSS";
type JutsuTypeFilter = "ALL" | "NINJUTSU" | "TAIJUTSU" | "DOJUTSU" | "GENJUTSU";

type CombinedTechnique = 
  | (JutsuModel & { type: "JUTSU" })
  | (SummoningModel & { type: "SUMMONING" });

const TECHNIQUE_TYPE_OPTIONS = ["ALL", "JUTSU", "SUMMONING"] as const;
const RANK_OPTIONS = ["ALL", "C", "B", "A", "S", "SS", "SSS"] as const;

const TECHNIQUE_TYPE_LABEL: Record<TechniqueType, string> = {
  ALL: "Todas",
  JUTSU: "Jutsus",
  SUMMONING: "Invocações",
};

const RANK_LABEL: Record<RankFilter, string> = {
  ALL: "Todos",
  C: "C",
  B: "B",
  A: "A",
  S: "S",
  SS: "SS",
  SSS: "SSS",
};

interface TechniquesGridProps {
  jutsus: JutsuModel[];
  summonings: SummoningModel[];
  role: AppRole;
}

export function TechniquesGrid({
  jutsus,
  summonings,
  role,
}: TechniquesGridProps) {
  const itemsPerPage = 10;
  const canEdit = role === "KAGE";

  // Filters
  const [techniqueTypeFilter, setTechniqueTypeFilter] = useState<TechniqueType>("ALL");
  const [rankFilter, setRankFilter] = useState<RankFilter>("ALL");
  const [jutsuTypeFilter, setJutsuTypeFilter] = useState<JutsuTypeFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Selection
  const [selectedJutsu, setSelectedJutsu] = useState<JutsuModel | null>(null);
  const [selectedSummoning, setSelectedSummoning] = useState<SummoningModel | null>(null);

  // Combine all techniques
  const allTechniques: CombinedTechnique[] = useMemo(() => {
    const combined: CombinedTechnique[] = [
      ...jutsus.map((j) => ({ ...j, type: "JUTSU" as const })),
      ...summonings.map((s) => ({ ...s, type: "SUMMONING" as const })),
    ];

    // Filter by technique type
    let filtered = combined.filter((tech) => {
      if (techniqueTypeFilter === "ALL") return true;
      return tech.type === techniqueTypeFilter;
    });

    // Filter by rank
    if (rankFilter !== "ALL") {
      filtered = filtered.filter((tech) => tech.rankValue === rankFilter);
    }

    // Filter by jutsu type (only for jutsus)
    if (jutsuTypeFilter !== "ALL") {
      filtered = filtered.filter((tech) => {
        if (tech.type === "JUTSU") {
          return (tech as JutsuModel).techniqueTypeCode === jutsuTypeFilter;
        }
        return true;
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((tech) =>
        tech.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [
    jutsus,
    summonings,
    techniqueTypeFilter,
    rankFilter,
    jutsuTypeFilter,
    searchQuery,
  ]);

  const totalPages = Math.max(1, Math.ceil(allTechniques.length / itemsPerPage));

  const visibleTechniques = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return allTechniques.slice(start, start + itemsPerPage);
  }, [allTechniques, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setCurrentPage(1);
  };

  const jutsusCount = allTechniques.filter((t) => t.type === "JUTSU").length;
  const summoningsCount = allTechniques.filter((t) => t.type === "SUMMONING").length;
  const categorySummary =
    techniqueTypeFilter === "JUTSU"
      ? `${jutsusCount} jutsus`
      : techniqueTypeFilter === "SUMMONING"
        ? `${summoningsCount} invocações`
        : `${jutsusCount} jutsus, ${summoningsCount} invocações`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-bold text-3xl">TÉCNICAS</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo de Jutsus e Invocações com filtros avançados
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            Todas as técnicas visíveis para membros aprovados.
            {canEdit && (
              <span className="ml-2 font-medium text-foreground">
                Edição habilitada para KAGE.
              </span>
            )}
          </div>
          {!canEdit && (
            <div className="text-xs">
              Somente usuários KAGE podem editar técnicas.
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold">Filtros</h3>

        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Pesquisar por nome</label>
          <Input
            placeholder="Digite o nome da técnica..."
            value={searchQuery}
            onChange={(e) => {
              handleFilterChange(() => setSearchQuery(e.target.value));
            }}
            className="w-full"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Technique Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Técnica</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 w-full justify-between px-3">
                  <span className="font-medium text-red-600">{TECHNIQUE_TYPE_LABEL[techniqueTypeFilter]}</span>
                  <span className="text-xs text-muted-foreground">
                    {techniqueTypeFilter === "ALL"
                      ? `${allTechniques.length} técnicas`
                      : techniqueTypeFilter === "JUTSU"
                        ? `${jutsusCount} jutsus`
                        : `${summoningsCount} invocações`}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                <DropdownMenuRadioGroup
                  value={techniqueTypeFilter}
                  onValueChange={(value) =>
                    handleFilterChange(() => setTechniqueTypeFilter(value as TechniqueType))
                  }
                >
                  {TECHNIQUE_TYPE_OPTIONS.map((type) => (
                    <DropdownMenuRadioItem
                      key={type}
                      value={type}
                      className="data-[state=checked]:font-semibold data-[state=checked]:text-red-600"
                    >
                      {TECHNIQUE_TYPE_LABEL[type]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Rank Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rank</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 w-full justify-between px-3">
                  <span className="font-medium text-red-600">{RANK_LABEL[rankFilter]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                <DropdownMenuRadioGroup
                  value={rankFilter}
                  onValueChange={(value) =>
                    handleFilterChange(() => setRankFilter(value as RankFilter))
                  }
                >
                  {RANK_OPTIONS.map((rank) => (
                    <DropdownMenuRadioItem
                      key={rank}
                      value={rank}
                      className="data-[state=checked]:font-semibold data-[state=checked]:text-red-600"
                    >
                      {RANK_LABEL[rank]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Jutsu Type Filter (only show when applicable) */}
        {techniqueTypeFilter !== "SUMMONING" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Jutsu</label>
            <div className="flex flex-wrap gap-2">
              {(["ALL", "NINJUTSU", "TAIJUTSU", "DOJUTSU", "GENJUTSU"] as const).map(
                (type) => (
                  <Button
                    key={type}
                    variant={jutsuTypeFilter === type ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      handleFilterChange(() => setJutsuTypeFilter(type))
                    }
                  >
                    {type === "ALL"
                      ? "Todos"
                      : type.charAt(0) + type.slice(1).toLowerCase()}
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="space-x-2">
          <span>
            Exibindo {visibleTechniques.length} de {allTechniques.length} técnicas
          </span>
          {allTechniques.length > 0 && (
            <span className="text-xs">
              ({categorySummary})
            </span>
          )}
        </div>
        <div>
          Página {currentPage} de {totalPages}
        </div>
      </div>

      {/* Techniques Grid */}
      {visibleTechniques.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleTechniques.map((technique) => {
            if (technique.type === "JUTSU") {
              const jutsu = technique as JutsuModel;
              return (
                <JutsuCard
                  key={jutsu.id}
                  jutsu={jutsu}
                  onOpen={() => setSelectedJutsu(jutsu)}
                />
              );
            } else {
              const summoning = technique as SummoningModel;
              return (
                <SummoningCard
                  key={summoning.id}
                  summoning={summoning}
                  onOpen={() => setSelectedSummoning(summoning)}
                />
              );
            }
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhuma técnica encontrada com os filtros selecionados.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setTechniqueTypeFilter("ALL");
              setRankFilter("ALL");
              setJutsuTypeFilter("ALL");
              setSearchQuery("");
              setCurrentPage(1);
            }}
          >
            Limpar filtros
          </Button>
        </div>
      )}

      {/* Pagination */}
      {allTechniques.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            Anterior
          </Button>
          <div className="text-sm text-muted-foreground">
            {itemsPerPage} técnicas por página
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Modals */}
      {selectedJutsu && (
        <JutsuSpecSheet
          jutsu={selectedJutsu}
          canEdit={canEdit}
          onClose={() => setSelectedJutsu(null)}
        />
      )}
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
