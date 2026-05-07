"use client";

import { ExternalLink, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { JutsuModel } from "@/lib/jutsus/query-parser";

type JutsuSpecSheetProps = {
  jutsu: JutsuModel;
  onClose: () => void;
};

export function JutsuSpecSheet({ jutsu, onClose }: JutsuSpecSheetProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-3 md:p-8 overflow-y-auto">
      <div className="mx-auto max-w-5xl">
        <Card className="border-2 border-primary/20">
          <CardHeader className="border-b bg-card">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Jutsu Specification
                </p>
                <CardTitle className="text-3xl md:text-4xl">{jutsu.name}</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">{jutsu.type}</Badge>
                  <Badge variant="secondary">Rank {jutsu.rank}</Badge>
                  <Badge variant="outline">Price {jutsu.price}</Badge>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={onClose} aria-label="Close details">
                <X size={16} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Chackra</p>
                <p className="text-2xl font-bold">{jutsu.chackra}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">ATK</p>
                <p className="text-lg font-semibold">{jutsu.atk ?? "N/A"}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Cooldown</p>
                <p className="text-lg font-semibold">
                  {jutsu.cooldown !== null ? `${jutsu.cooldown}s` : "N/A"}
                </p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Targets</p>
                <p className="text-sm font-semibold">{jutsu.targets ?? "N/A"}</p>
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {jutsu.description}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold">Requirements</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {jutsu.requirements ?? "No requirements specified."}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold">Observations</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {jutsu.observations ?? "No observations listed."}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold">Escape</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {jutsu.escape ?? "No escape notes listed."}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold">Characters</h3>
              <p className="text-sm text-muted-foreground">
                {jutsu.characters && jutsu.characters.length > 0
                  ? jutsu.characters.join(", ")
                  : "No character restriction"}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold">Visible To Roles</h3>
              <div className="flex flex-wrap gap-2">
                {jutsu.available_to_roles.map((role) => (
                  <Badge key={role} variant="outline">
                    {role}
                  </Badge>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-accent/30 bg-accent/10 p-4">
              <h3 className="text-sm font-semibold mb-1">Reference</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Open the external wiki/details link for this jutsu.
              </p>
              <Button variant="default" className="gap-2" asChild>
                <a href={jutsu.link} target="_blank" rel="noreferrer">
                  Open Reference
                  <ExternalLink size={14} />
                </a>
              </Button>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
