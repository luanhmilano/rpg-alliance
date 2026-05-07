"use client";

import { useState, useMemo } from "react";
import { JutsuCard } from "@/components/jutsus/jutsu-card";
import type { AppRole } from "@/lib/access-control";
import type { Jutsu } from "@/data/jutsus-mock";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FilterState = {
  name: string;
  type: "" | "Ninjutsu" | "Taijutsu" | "Genjutsu" | "Fuinjutsu";
  minPrice: number;
  maxPrice: number;
  rank: "" | "S" | "A" | "B" | "C" | "D";
  sortBy: "name" | "price" | "rank" | "difficulty";
};

export function JutsusGrid({
  jutsus,
  role,
}: {
  jutsus: Jutsu[];
  role: AppRole;
}) {
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    type: "",
    minPrice: 0,
    maxPrice: 10000,
    rank: "",
    sortBy: "name",
  });

  // Apply role-based visibility first, then apply filters
  const filteredJutsus = useMemo(() => {
    let result =
      role === "KAGE"
        ? jutsus
        : jutsus.filter((jutsu) => jutsu.availableToRoles.includes("MEMBER"));

    // Apply name filter
    if (filters.name) {
      result = result.filter((j) =>
        j.name.toLowerCase().includes(filters.name.toLowerCase())
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
          const rankOrder = { S: 0, A: 1, B: 2, C: 3, D: 4 };
          return rankOrder[a.rank] - rankOrder[b.rank];
        }
        case "difficulty":
          return a.difficulty - b.difficulty;
        default:
          return 0;
      }
    });

    return result;
  }, [jutsus, role, filters]);

  const handleReset = () => {
    setFilters({
      name: "",
      type: "",
      minPrice: 0,
      maxPrice: 10000,
      rank: "",
      sortBy: "name",
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-sm">Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Name Search */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Name</label>
            <Input
              placeholder="Search jutsu..."
              value={filters.name}
              onChange={(e) =>
                setFilters({ ...filters, name: e.target.value })
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
              <option value="Ninjutsu">Ninjutsu</option>
              <option value="Taijutsu">Taijutsu</option>
              <option value="Genjutsu">Genjutsu</option>
              <option value="Fuinjutsu">Fuinjutsu</option>
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
              <option value="S">S</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          {/* Price Range */}
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
              <option value="difficulty">Difficulty</option>
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
        Showing {filteredJutsus.length} of {role === "KAGE" ? jutsus.length : jutsus.filter((j) => j.availableToRoles.includes("MEMBER")).length} jutsus
      </div>

      {/* Jutsus Grid */}
      {filteredJutsus.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJutsus.map((jutsu) => (
            <JutsuCard key={jutsu.id} jutsu={jutsu} />
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
