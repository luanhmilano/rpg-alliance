"use client";

import { useEffect, useMemo, useState } from "react";
import { JutsuCard } from "@/components/jutsus/jutsu-card";
import type { AppRole } from "@/lib/access-control";
import {
  JUTSU_RANKS,
  JUTSU_TYPES,
  parseJutsuFiltersFromSearchParams,
  type JutsuModel,
} from "@/lib/jutsus/query-parser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type FilterState = {
  q: string;
  type: "" | "Ninjutsu" | "Taijutsu" | "Dojutsu" | "Genjutsu";
  minPrice: number;
  maxPrice: number;
  minChackra: number;
  maxChackra: number;
  maxCooldown: number;
  character: string;
  targets: string;
  rank: "" | "C" | "B" | "A" | "S" | "SS" | "SSS";
  sortBy: "name" | "price" | "rank" | "chackra" | "cooldown";
};

function buildFilterState(searchParams: URLSearchParams): FilterState {
  const parsed = parseJutsuFiltersFromSearchParams(searchParams);

  return {
    q: parsed.q ?? "",
    type: parsed.type ?? "",
    minPrice: parsed.minPrice ?? 0,
    maxPrice: parsed.maxPrice ?? 1000000,
    minChackra: parsed.minChackra ?? 0,
    maxChackra: parsed.maxChackra ?? 1000000,
    maxCooldown: parsed.maxCooldown ?? 1000000,
    character: parsed.character ?? "",
    targets: parsed.targets ?? "",
    rank: parsed.rank ?? "",
    sortBy: "name",
  };
}

function normalizeFilterState(state: FilterState): FilterState {
  return {
    ...state,
    q: state.q ?? "",
    type: state.type ?? "",
    rank: state.rank ?? "",
    character: state.character ?? "",
    targets: state.targets ?? "",
    minPrice: Number.isFinite(state.minPrice) ? state.minPrice : 0,
    maxPrice: Number.isFinite(state.maxPrice) ? state.maxPrice : 1000000,
    minChackra: Number.isFinite(state.minChackra) ? state.minChackra : 0,
    maxChackra: Number.isFinite(state.maxChackra) ? state.maxChackra : 1000000,
    maxCooldown: Number.isFinite(state.maxCooldown) ? state.maxCooldown : 1000000,
    sortBy: state.sortBy ?? "name",
  };
}

const rankOrder: Record<Exclude<FilterState["rank"], "">, number> = {
  C: 0,
  B: 1,
  A: 2,
  S: 3,
  SS: 4,
  SSS: 5,
};

export function JutsusGrid({
  jutsus,
  role,
}: {
  jutsus: JutsuModel[];
  role: AppRole;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>(() =>
    normalizeFilterState(buildFilterState(new URLSearchParams(searchParams.toString())))
  );

  useEffect(() => {
    setFilters(
      normalizeFilterState(
        buildFilterState(new URLSearchParams(searchParams.toString()))
      )
    );
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.q) {
      params.set("q", filters.q);
    }
    if (filters.type) {
      params.set("type", filters.type);
    }
    if (filters.rank) {
      params.set("rank", filters.rank);
    }
    if (filters.minPrice > 0) {
      params.set("minPrice", String(filters.minPrice));
    }
    if (filters.maxPrice < 1000000) {
      params.set("maxPrice", String(filters.maxPrice));
    }
    if (filters.minChackra > 0) {
      params.set("minChackra", String(filters.minChackra));
    }
    if (filters.maxChackra < 1000000) {
      params.set("maxChackra", String(filters.maxChackra));
    }
    if (filters.maxCooldown < 1000000) {
      params.set("maxCooldown", String(filters.maxCooldown));
    }
    if (filters.character) {
      params.set("character", filters.character);
    }
    if (filters.targets) {
      params.set("targets", filters.targets);
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    }
  }, [filters, pathname, router, searchParams]);

  // Apply role-based visibility first, then apply filters
  const filteredJutsus = useMemo(() => {
    let result =
      role === "KAGE"
        ? jutsus
        : jutsus.filter((jutsu) => jutsu.available_to_roles.includes("MEMBER"));

    // Apply name filter
    if (filters.q) {
      result = result.filter((j) =>
        j.name.toLowerCase().includes(filters.q.toLowerCase()) ||
        j.description.toLowerCase().includes(filters.q.toLowerCase())
      );
    }

    // Apply type filter
    if (filters.type) {
      result = result.filter((j) => j.type === filters.type);
    }

    // Apply price range filter
    result = result.filter(
      (j) => j.price >= filters.minPrice && j.price <= filters.maxPrice
    );

    // Apply chakra range filter
    result = result.filter(
      (j) => j.chackra >= filters.minChackra && j.chackra <= filters.maxChackra
    );

    // Apply cooldown filter
    result = result.filter(
      (j) => (j.cooldown ?? 0) <= filters.maxCooldown
    );

    // Apply character filter
    if (filters.character) {
      result = result.filter((j) =>
        (j.characters ?? []).some(
          (character) =>
            character.toLowerCase().includes(filters.character.toLowerCase())
        )
      );
    }

    // Apply targets filter
    if (filters.targets) {
      result = result.filter((j) =>
        (j.targets ?? "").toLowerCase().includes(filters.targets.toLowerCase())
      );
    }

    // Apply rank filter
    if (filters.rank) {
      result = result.filter((j) => j.rank === filters.rank);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.price - b.price;
        case "rank": {
          return rankOrder[a.rank] - rankOrder[b.rank];
        }
        case "chackra":
          return a.chackra - b.chackra;
        case "cooldown":
          return (a.cooldown ?? 0) - (b.cooldown ?? 0);
        default:
          return 0;
      }
    });

    return result;
  }, [jutsus, role, filters]);

  const handleReset = () => {
    setFilters({
      q: "",
      type: "",
      minPrice: 0,
      maxPrice: 1000000,
      minChackra: 0,
      maxChackra: 1000000,
      maxCooldown: 1000000,
      character: "",
      targets: "",
      rank: "",
      sortBy: "name",
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-sm">Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-3">
          {/* Name Search */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Name</label>
            <Input
              placeholder="Search jutsu..."
              value={filters.q}
              onChange={(e) =>
                setFilters({ ...filters, q: e.target.value })
              }
              className="h-8 text-sm"
            />
          </div>

          {/* Type Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Type</label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: e.target.value as FilterState["type"],
                })
              }
              className="h-8 w-full rounded border border-input bg-background px-2 py-1 text-sm"
            >
              <option value="">All Types</option>
              {JUTSU_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Rank Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Rank</label>
            <select
              value={filters.rank}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  rank: e.target.value as FilterState["rank"],
                })
              }
              className="h-8 w-full rounded border border-input bg-background px-2 py-1 text-sm"
            >
              <option value="">All Ranks</option>
              {JUTSU_RANKS.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Min Price</label>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters({ ...filters, minPrice: parseInt(e.target.value, 10) || 0 })
              }
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Max Price</label>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({ ...filters, maxPrice: parseInt(e.target.value) || 0 })
              }
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Min Chakra</label>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minChackra}
              onChange={(e) =>
                setFilters({ ...filters, minChackra: parseInt(e.target.value, 10) || 0 })
              }
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Max Chakra</label>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxChackra}
              onChange={(e) =>
                setFilters({ ...filters, maxChackra: parseInt(e.target.value, 10) || 0 })
              }
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Max Cooldown</label>
            <Input
              type="number"
              placeholder="Seconds"
              value={filters.maxCooldown}
              onChange={(e) =>
                setFilters({ ...filters, maxCooldown: parseInt(e.target.value, 10) || 0 })
              }
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Character</label>
            <Input
              placeholder="e.g. Hashirama"
              value={filters.character}
              onChange={(e) =>
                setFilters({ ...filters, character: e.target.value })
              }
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Targets</label>
            <Input
              placeholder="target type"
              value={filters.targets}
              onChange={(e) =>
                setFilters({ ...filters, targets: e.target.value })
              }
              className="h-8 text-sm"
            />
          </div>

          {/* Sort */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortBy: e.target.value as FilterState["sortBy"],
                })
              }
              className="h-8 w-full rounded border border-input bg-background px-2 py-1 text-sm"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="rank">Rank</option>
              <option value="chackra">Chakra</option>
              <option value="cooldown">Cooldown</option>
            </select>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredJutsus.length} of {role === "KAGE" ? jutsus.length : jutsus.filter((j) => j.available_to_roles.includes("MEMBER")).length} jutsus
      </div>

      {/* Jutsus Grid */}
      {filteredJutsus.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJutsus.map((jutsu) => (
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
    </div>
  );
}
