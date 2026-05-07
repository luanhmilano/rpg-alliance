import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Jutsu } from "@/data/jutsus-mock";

const rankVariantMap: Record<Jutsu["rank"], "default" | "secondary" | "destructive" | "outline"> = {
  S: "destructive",
  A: "default",
  B: "secondary",
  C: "outline",
  D: "outline",
};

export function JutsuCard({ jutsu }: { jutsu: Jutsu }) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">{jutsu.name}</CardTitle>
          <Badge variant={rankVariantMap[jutsu.rank]}>Rank {jutsu.rank}</Badge>
        </div>
        <CardDescription>{jutsu.type}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">{jutsu.description}</p>
        <div className="flex items-center gap-4">
          <span>Chakra: {jutsu.chakraCost}</span>
          <span>Difficulty: {jutsu.difficulty}/10</span>
        </div>
        {jutsu.handSeals.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Hand seals: {jutsu.handSeals.join(", ")}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Hand seals: None</p>
        )}
      </CardContent>
    </Card>
  );
}
