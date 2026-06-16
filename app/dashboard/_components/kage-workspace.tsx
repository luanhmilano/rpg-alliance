import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function KageWorkspace() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            KAGE Workspace
          </p>
          <h2 className="text-xl font-semibold">
            Administre técnicas e a base do clã
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Crie novas técnicas, ajuste as existentes e vá para a área de
            gestão de jogadores, vilas e personagens.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/techniques/new">Nova técnica</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/techniques">Editar técnicas</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard/kage">Gestão KAGE</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}