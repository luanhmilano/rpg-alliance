import 'server-only';
import { JutsusGrid } from "@/app/dashboard/_components/jutsus-grid";
import { getJutsus } from "@/server/repositories/jutsus.repository";
import { JutsusSectionProps } from "../types";

export async function JutsusSection({ role }: JutsusSectionProps) {
  const jutsus = await getJutsus();

  if (!jutsus.length) {
    return <p className="text-muted-foreground">Nenhum jutsu encontrado.</p>;
  }

  return <JutsusGrid jutsus={jutsus} role={role} />;
}