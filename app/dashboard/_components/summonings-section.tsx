import "server-only";

import { getSummonings } from "@/server/repositories/summonings.repository";

import { SummoningsGrid } from "@/app/dashboard/_components/summonings-grid";
import type { SummoningsSectionProps } from "@/app/dashboard/types";

export async function SummoningsSection({ role }: SummoningsSectionProps) {
  const summonings = await getSummonings();

  if (!summonings.length) {
    return <p className="text-muted-foreground">Nenhuma invocação encontrada.</p>;
  }

  return <SummoningsGrid summonings={summonings} role={role} />;
}