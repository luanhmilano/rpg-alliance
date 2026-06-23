import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SummoningModel } from "@/server/repositories/summonings.repository";

export function SummoningCard({
  summoning,
  onOpen,
  href,
}: {
  summoning: SummoningModel;
  onOpen?: (summoning: SummoningModel) => void;
  href?: string;
}) {
  const updatedLabel = new Date(summoning.updatedAt).toLocaleDateString("pt-BR");

  const cardContent = (
    <Card
      className="h-full cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => onOpen?.(summoning)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen?.(summoning);
        }
      }}
    >
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">{summoning.name}</CardTitle>
          <Badge variant="secondary">{summoning.techniqueTypeCode}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          {summoning.observations ?? "Sem observações cadastradas para esta invocação."}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <span>Categoria: {summoning.kind}</span>
          <span>Rank: {summoning.rankValue ?? "N/D"}</span>
          <span>Tipo: {summoning.techniqueTypeName ?? summoning.techniqueTypeCode}</span>
          <span>Atualizado em: {updatedLabel}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}