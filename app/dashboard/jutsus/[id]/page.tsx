import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireApprovedProfile } from "@/lib/access-control";
import { createClient } from "@/lib/supabase/server";

type JutsuDetailsRecord = {
  id: string;
  kind: "JUTSU";
  name: string;
  technique_type_id: string;
  rank_id: string;
  link: string | null;
  observations: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  technique_types: { code: string; name: string | null } | null;
  ranks: { value: string } | null;
};

type JutsuPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JutsuDetailsPage({ params }: JutsuPageProps) {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Carregando detalhes do jutsu...</div>}>
      <JutsuDetailsContent params={params} />
    </Suspense>
  );
}

async function JutsuDetailsContent({ params }: JutsuPageProps) {
  const profile = await requireApprovedProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("techniques")
    .select("id,kind,name,technique_type_id,rank_id,link,observations,updated_by,created_at,updated_at,technique_types(code,name),ranks(value)")
    .eq("id", id)
    .eq("kind", "JUTSU")
    .single();

  if (error) {
    notFound();
  }

  const jutsu = (data as JutsuDetailsRecord | null) ?? null;

  if (!jutsu) {
    notFound();
  }

  const createdLabel = new Date(jutsu.created_at).toLocaleString("pt-BR");
  const updatedLabel = new Date(jutsu.updated_at).toLocaleString("pt-BR");

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ficha do jutsu</p>
          <h1 className="text-3xl md:text-4xl font-bold">{jutsu.name}</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Voltar para o catalogo</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">{jutsu.kind}</Badge>
              <Badge variant="secondary">{jutsu.technique_types?.code ?? "UNKNOWN"}</Badge>
              <Badge variant="outline">Rank {jutsu.ranks?.value ?? "N/D"}</Badge>
            </div>
            <CardTitle className="text-xl">Especificacao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <section className="space-y-1">
              <h2 className="font-semibold">Observacoes</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {jutsu.observations ?? "Nenhuma observacao cadastrada."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Referencias</h2>
              <p className="text-muted-foreground break-all">ID da tecnica: {jutsu.id}</p>
              <p className="text-muted-foreground break-all">ID do tipo: {jutsu.technique_type_id}</p>
              <p className="text-muted-foreground break-all">ID do rank: {jutsu.rank_id}</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Auditoria</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                Criado em: {createdLabel}
              </p>
              <p className="text-muted-foreground whitespace-pre-line">Atualizado em: {updatedLabel}</p>
              <p className="text-muted-foreground break-all">Atualizado por: {jutsu.updated_by ?? "Sistema"}</p>
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Links e Acoes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {jutsu.link ? (
              <Button asChild className="w-full">
                <Link href={jutsu.link} target="_blank" rel="noreferrer">
                  Abrir referencia
                </Link>
              </Button>
            ) : (
              <Button className="w-full" disabled>
                Abrir referencia
              </Button>
            )}
            {profile.role === "KAGE" && (
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/techniques/${jutsu.id}/edit`}>Editar</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
