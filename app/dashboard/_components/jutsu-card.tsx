import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { JutsuModel } from "@/lib/jutsus/query-parser";
import Link from "next/link";

export function JutsuCard({
  jutsu,
  onOpen,
  href,
}: {
  jutsu: JutsuModel;
  onOpen?: (jutsu: JutsuModel) => void;
  href?: string;
}) {
  const updatedLabel = new Date(jutsu.updatedAt).toLocaleDateString("pt-BR");

  const cardContent = (
    <Card
      className="h-full cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => onOpen?.(jutsu)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen?.(jutsu);
        }
      }}
    >
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">{jutsu.name}</CardTitle>
          <Badge variant="secondary">{jutsu.techniqueTypeCode}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          {jutsu.observations ?? "Sem observacoes cadastradas para este jutsu."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <span>Categoria: {jutsu.kind}</span>
          <span>Rank: {jutsu.rankValue ?? "N/D"}</span>
          <span>Tipo: {jutsu.techniqueTypeName ?? jutsu.techniqueTypeCode}</span>
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
