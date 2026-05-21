/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireKageProfile } from "@/lib/access-control";
import { createClient } from "@/lib/supabase/server";

async function TechniquesAdminContent() {
  await requireKageProfile();
  const supabase = await createClient();

  const { data: techniques } = await supabase
    .from("techniques")
    .select("id,kind,name,rank_id,link,observations,updated_at,ranks(value)")
    .order("updated_at", { ascending: false });

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            KAGE Techniques
          </p>
          <h1 className="text-3xl font-bold">Gestão de técnicas</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Crie e edite técnicas direto no dashboard. Cada alteração vira
            histórico no feed de updates.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/techniques/new">Nova técnica</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Técnicas registradas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {techniques && techniques.length > 0 ? (
            techniques.map((technique: any) => (
              <div
                key={technique.id}
                className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-semibold">{technique.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {technique.kind} • Rank{" "}
                    {technique.ranks?.value ?? technique.rank_id}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/techniques/${technique.id}/edit`}>
                    Editar
                  </Link>
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma técnica encontrada.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TechniquesAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">
          Loading techniques...
        </div>
      }
    >
      <TechniquesAdminContent />
    </Suspense>
  );
}
