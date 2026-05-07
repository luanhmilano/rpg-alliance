import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { JutsuModel } from "@/lib/jutsus/query-parser";
import Link from "next/link";

const rankVariantMap: Record<JutsuModel["rank"], "default" | "secondary" | "destructive" | "outline"> = {
  SSS: "destructive",
  SS: "destructive",
  S: "destructive",
  A: "default",
  B: "secondary",
  C: "outline",
};

export function JutsuCard({
  jutsu,
  onOpen,
  href,
}: {
  jutsu: JutsuModel;
  onOpen?: (jutsu: JutsuModel) => void;
  href?: string;
}) {
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
          <Badge variant={rankVariantMap[jutsu.rank]}>Rank {jutsu.rank}</Badge>
        </div>
        <CardDescription>{jutsu.type}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">{jutsu.description}</p>
        <div className="grid grid-cols-2 gap-2">
          <span>Chakra: {jutsu.chackra}</span>
          <span>Price: {jutsu.price}</span>
          <span>Cooldown: {jutsu.cooldown !== null ? `${jutsu.cooldown}s` : "N/A"}</span>
          <span>ATK: {jutsu.atk ?? "N/A"}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Targets: {jutsu.targets ?? "Not informed"}
        </p>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}
