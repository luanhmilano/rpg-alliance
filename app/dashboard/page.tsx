import { Suspense } from "react";
import { requireApprovedProfile } from "@/lib/access-control";
import { KageWorkspace } from "./_components/kage-workspace";
import { JutsusSection } from "./_components/jutsus-section";

export default async function DashboardPage() {
  const profile = await requireApprovedProfile();

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="space-y-1">
        <h1 className="font-bold text-3xl">JUTSUS</h1>
        <p className="text-sm text-muted-foreground">
          Role: {profile.role} | Access: {profile.approval_status}
        </p>
      </div>

      {profile.role === "KAGE" && <KageWorkspace />}

      <div>
        <Suspense 
          fallback={
            <div className="h-64 w-full bg-primary/5 border border-primary/10 rounded-md animate-pulse flex items-center justify-center">
               <p className="text-sm text-muted-foreground">Carregando pergaminhos de jutsus...</p>
            </div>
          }
        >
          <JutsusSection role={profile.role} />
        </Suspense>
      </div>
    </div>
  );
}
