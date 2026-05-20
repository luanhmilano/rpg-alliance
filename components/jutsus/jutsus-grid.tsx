"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { JutsuCard } from "@/components/jutsus/jutsu-card";
import type { AppRole } from "@/lib/access-control";
import { JUTSU_RANKS, type JutsuModel } from "@/lib/jutsus/query-parser";

type FilterState = {
  rank: "" | "C" | "B" | "A" | "S" | "SS" | "SSS";
};

function normalizeFilterState(state: FilterState): FilterState {
  return {
    ...state,
    rank: state.rank ?? "",
  };
}

export function JutsusGrid({
  jutsus,
  role,
}: {
  jutsus: JutsuModel[];
  role: AppRole;
}) {
  const itemsPerPage = 10;
  const [filters, setFilters] = useState<FilterState>(() =>
    normalizeFilterState({ rank: "" }),
  );
  const [currentPage, setCurrentPage] = useState(1);

  const filteredJutsus = useMemo(() => {
    let result =
      role === "KAGE"
        ? jutsus
        : jutsus.filter((jutsu) => jutsu.available_to_roles.includes("MEMBER"));

    if (filters.rank) {
      result = result.filter((j) => j.rank === filters.rank);
    }

    return result;
  }, [jutsus, role, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredJutsus.length / itemsPerPage),
  );
  const visibleJutsus = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredJutsus.slice(start, start + itemsPerPage);
  }, [currentPage, filteredJutsus]);

  const currentRank = filters.rank;

  const handleReset = () => {
    setFilters({ rank: "" });
    setCurrentPage(1);
  };

  const handleRankChange = (value: FilterState["rank"]) => {
    setFilters({ rank: value });
    setCurrentPage(1);
  };

  const goToPage = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <label className="text-xs font-medium">Rank</label>
            <select
              value={currentRank}
              onChange={(event) =>
                handleRankChange(event.target.value as FilterState["rank"])
              }
              className="h-9 w-full rounded border border-input bg-background px-2 py-1 text-sm md:w-56"
            >
              <option value="">All Ranks</option>
              {JUTSU_RANKS.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={handleReset}>
            Limpar rank
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          Showing {visibleJutsus.length} of {filteredJutsus.length} jutsus
        </div>
        <div>
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {visibleJutsus.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleJutsus.map((jutsu) => (
            <JutsuCard
              key={jutsu.id}
              jutsu={jutsu}
              href={`/dashboard/jutsus/${jutsu.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No jutsus found matching your filters.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          10 jutsus por página
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
