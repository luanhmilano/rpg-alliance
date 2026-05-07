import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireApprovedProfile } from "@/lib/access-control";
import { normalizeJutsuRecord } from "@/lib/jutsus/normalize";
import { createClient } from "@/lib/supabase/server";
import type { JutsuModel } from "@/lib/jutsus/query-parser";

type JutsuPageProps = {
  params: Promise<{ id: string }>;
};

const rankVariantMap = {
  SSS: "destructive",
  SS: "destructive",
  S: "destructive",
  A: "default",
  B: "secondary",
  C: "outline",
} as const;

export default async function JutsuDetailsPage({ params }: JutsuPageProps) {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading jutsu details...</div>}>
      <JutsuDetailsContent params={params} />
    </Suspense>
  );
}

async function JutsuDetailsContent({ params }: JutsuPageProps) {
  const profile = await requireApprovedProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jutsus")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    notFound();
  }

  const jutsu = data ? (normalizeJutsuRecord(data as Record<string, unknown>) as JutsuModel) : null;

  if (!jutsu) {
    notFound();
  }

  if (!jutsu.available_to_roles.includes(profile.role)) {
    notFound();
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Jutsu Product</p>
          <h1 className="text-3xl md:text-4xl font-bold">{jutsu.name}</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to catalog</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={rankVariantMap[jutsu.rank]}>Rank {jutsu.rank}</Badge>
              <Badge variant="secondary">{jutsu.type}</Badge>
              <Badge variant="outline">Price {jutsu.price}</Badge>
            </div>
            <CardTitle className="text-xl">Specification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <section className="space-y-1">
              <h2 className="font-semibold">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{jutsu.description}</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">ATK</h2>
              <p className="text-muted-foreground">{jutsu.atk ?? "Not specified"}</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Requirements</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {jutsu.requirements ?? "No requirements specified."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Observations</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {jutsu.observations ?? "No observations registered."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-semibold">Escape</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {jutsu.escape ?? "No escape interaction documented."}
              </p>
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Core Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Chakra</p>
              <p className="text-xl font-bold">{jutsu.chackra}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Cooldown</p>
              <p className="text-xl font-bold">
                {jutsu.cooldown !== null ? `${jutsu.cooldown}s` : "N/A"}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-xl font-bold">{jutsu.price}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Targets</p>
              <p className="text-sm font-medium">{jutsu.targets ?? "Not informed"}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Characters</p>
              <p className="text-sm font-medium">
                {jutsu.characters && jutsu.characters.length > 0
                  ? jutsu.characters.join(", ")
                  : "No character restriction"}
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href={jutsu.link} target="_blank" rel="noreferrer">
                Open Reference
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
