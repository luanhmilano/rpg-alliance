import { Suspense } from "react";
import { requireApprovedProfile } from "@/lib/access-control";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";

type TechniqueUpdate = {
  id: string;
  technique_id: string | null;
  created_at: string;
  changed_fields: string[];
  technique_name: string;
  changed_by_identity: string | null;
  changed_by_role: string;
};

async function UpdatesFeedContent() {
  await requireApprovedProfile();
  const supabase = await createClient();

  let updates: TechniqueUpdate[] = [];

  // Try to fetch real data from database
  type DBUpdate = {
    id: string;
    technique_id: string | null;
    created_at: string;
    changed_fields: string[];
    techniques: { name: string } | null;
    players: { email: string | null; roles: { name: string } | null } | null;
  };

  const { data: dbUpdates } = await supabase
    .from("technique_updates")
    .select(
      `
      id,
      technique_id,
      created_at,
      changed_fields,
      techniques(name),
      players(email, roles(name))
    `,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  // If database is not yet populated or error occurs, use mock data

  updates = (dbUpdates as unknown as DBUpdate[]).map((update) => ({
    id: update.id,
    technique_id: update.technique_id,
    created_at: update.created_at,
    changed_fields: update.changed_fields,
    technique_name: update.techniques?.name || "Unknown Technique",
    changed_by_identity: update.players?.email || "Unknown User",
    changed_by_role: update.players?.roles?.name || "MEMBER",
  }));

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="space-y-1">
        <h1 className="font-bold text-3xl">Jutsu Updates Feed</h1>
        <p className="text-sm text-muted-foreground">
          Recent changes made by KAGEs to jutsus
        </p>
      </div>

      {updates && updates.length > 0 ? (
        <div className="space-y-3">
          {updates.map((update: TechniqueUpdate) => (
            <Card key={update.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">
                      {update.technique_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Updated by{" "}
                      <span className="font-semibold">
                        {update.changed_by_identity}
                      </span>{" "}
                      ({update.changed_by_role})
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(update.created_at).toLocaleDateString()}{" "}
                    {new Date(update.created_at).toLocaleTimeString()}
                  </time>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Fields changed:</p>
                  <div className="flex flex-wrap gap-2">
                    {update.changed_fields?.map((field: string) => (
                      <span
                        key={field}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium"
                      >
                        {field.replaceAll("_", " ")}
                      </span>
                    )) || (
                      <span className="text-xs text-muted-foreground">
                        No fields recorded
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <InfoIcon
                className="mx-auto mb-3 text-muted-foreground"
                size={32}
              />
              <p className="text-muted-foreground">
                No jutsu updates yet. Check back later!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function UpdatesPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">
          Loading updates feed...
        </div>
      }
    >
      <UpdatesFeedContent />
    </Suspense>
  );
}
