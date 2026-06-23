import { Suspense } from "react";
import { requireApprovedProfile } from "@/lib/access-control";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { techniquesRepository } from "@/server/repositories/techniques.repository";

type TechniqueUpdate = {
  id: string;
  techniqueId: string | null;
  createdAt: string;
  changedFields: string[];
  techniqueName: string;
  changedByIdentity: string;
  changedByRole: string;
};

async function UpdatesFeedContent() {
  await requireApprovedProfile();
  const updates: TechniqueUpdate[] = await techniquesRepository.listUpdatesFeed(50);

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
                      {update.techniqueName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Updated by{" "}
                      <span className="font-semibold">
                        {update.changedByIdentity}
                      </span>{" "}
                      ({update.changedByRole})
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(update.createdAt).toLocaleDateString()} {" "}
                    {new Date(update.createdAt).toLocaleTimeString()}
                  </time>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Fields changed:</p>
                  <div className="flex flex-wrap gap-2">
                    {update.changedFields?.map((field: string) => (
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
