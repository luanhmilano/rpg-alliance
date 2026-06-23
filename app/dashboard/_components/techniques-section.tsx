import "server-only";

import { TechniquesGrid } from "@/app/dashboard/_components/techniques-grid";
import { getJutsus } from "@/server/repositories/jutsus.repository";
import { getSummonings } from "@/server/repositories/summonings.repository";
import type { AppRole } from "@/lib/access-control";

export async function TechniquesSection({ role }: { role: AppRole }) {
  const [jutsus, summonings] = await Promise.all([
    getJutsus(),
    getSummonings(),
  ]);

  return (
    <TechniquesGrid
      jutsus={jutsus}
      summonings={summonings}
      role={role}
    />
  );
}
