import { JutsuCard } from "@/components/jutsus/jutsu-card";
import type { AppRole } from "@/lib/access-control";
import type { Jutsu } from "@/data/jutsus-mock";

export function JutsusGrid({
  jutsus,
  role,
}: {
  jutsus: Jutsu[];
  role: AppRole;
}) {
  const visibleJutsus =
    role === "KAGE"
      ? jutsus
      : jutsus.filter((jutsu) => jutsu.availableToRoles.includes("MEMBER"));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {visibleJutsus.map((jutsu) => (
        <JutsuCard key={jutsu.id} jutsu={jutsu} />
      ))}
    </div>
  );
}
