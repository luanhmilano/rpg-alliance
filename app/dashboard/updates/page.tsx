import { Suspense } from "react";
import { requireApprovedProfile } from "@/lib/access-control";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { jutsuUpdatesMock } from "@/data/jutsu-updates-mock";

type JutsuUpdate = {
  id: string;
  jutsu_id: string;
  created_at: string;
  changed_fields: string[];
  jutsu_name: string;
  changed_by_identity: string | null;
  changed_by_role: string;
};

async function UpdatesFeedContent() {
  await requireApprovedProfile();
  const supabase = await createClient();

  let updates: JutsuUpdate[] = [];
  let usesMockData = false;

  // Try to fetch real data from database
  type DBUpdate = {
    id: string;
    jutsu_id: string;
    created_at: string;
    changed_fields: string[];
    jutsus: { name: string } | null;
    players: { email: string | null; roles: { name: string } | null } | null;
  };

  const { data: dbUpdates, error } = await supabase
    .from("jutsu_updates")
    .select(
      `
      id,
      jutsu_id,
      created_at,
      changed_fields,
      jutsus(name),
      players(email, roles(name))
    `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  // If database is not yet populated or error occurs, use mock data
  if (error || !dbUpdates || dbUpdates.length === 0) {
    usesMockData = true;
    updates = jutsuUpdatesMock.map((mock) => ({
      id: mock.id,
      jutsu_id: mock.jutsu_id,
      created_at: mock.created_at,
      changed_fields: mock.changed_fields,
      jutsu_name: mock.jutsu_name,
      changed_by_identity: mock.changed_by_identity,
      changed_by_role: mock.changed_by_role,
    }));
  } else {
    updates = (dbUpdates as unknown as DBUpdate[]).map((update) => ({
      id: update.id,
      jutsu_id: update.jutsu_id,
      created_at: update.created_at,
      changed_fields: update.changed_fields,
      jutsu_name: update.jutsus?.name || "Unknown Jutsu",
      changed_by_identity: update.players?.email || "Unknown User",
      changed_by_role: update.players?.roles?.name || "MEMBER",
    }));
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="space-y-1">
        <h1 className="font-bold text-3xl">Jutsu Updates Feed</h1>
        <p className="text-sm text-muted-foreground">
          Recent changes made by KAGEs to jutsus
        </p>
      </div>

      {usesMockData && (
        <div className="bg-accent/10 text-accent-foreground text-sm p-3 rounded-md flex gap-2 items-start">
          <InfoIcon size={16} className="flex-shrink-0 mt-0.5" />
          <p>Showing mock data. Connect to Supabase to see live updates.</p>
        </div>
      )}

      {updates && updates.length > 0 ? (
        <div className="space-y-3">
          {updates.map((update: JutsuUpdate) => (
            <Card key={update.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">
                      {update.jutsu_name}
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
                        {field.replace(/_/g, " ")}
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
              <InfoIcon className="mx-auto mb-3 text-muted-foreground" size={32} />
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
