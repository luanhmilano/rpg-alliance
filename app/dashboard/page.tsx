import { Suspense } from "react";
import { requireApprovedProfile } from "@/lib/access-control";
import { KageWorkspace } from "./_components/kage-workspace";
import { TechniquesSection } from "./_components/techniques-section";

async function DashboardContent() {
  const profile = await requireApprovedProfile();

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Role: {profile.role} | Access: {profile.approval_status}
        </p>
      </div>

      {profile.role === "KAGE" && <KageWorkspace />}

      <div>
        <Suspense 
          fallback={
            <div className="h-96 w-full bg-primary/5 border border-primary/10 rounded-md animate-pulse flex items-center justify-center">
               <p className="text-sm text-muted-foreground">Carregando pergaminhos e contratos...</p>
            </div>
          }
        >
          <TechniquesSection role={profile.role} />
        </Suspense>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 w-full flex flex-col gap-8">
          <div className="space-y-1">
            <div className="h-4 w-52 rounded bg-primary/10 animate-pulse" />
          </div>
          <div className="h-96 w-full bg-primary/5 border border-primary/10 rounded-md animate-pulse" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
