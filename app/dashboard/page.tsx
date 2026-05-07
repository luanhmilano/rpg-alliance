import { Suspense } from "react";
import { InfoIcon } from "lucide-react";

import { JutsusGrid } from "@/components/jutsus/jutsus-grid";
import { jutsusMock } from "@/data/jutsus-mock";
import { requireApprovedProfile } from "@/lib/access-control";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const profile = await requireApprovedProfile();

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          JUTSUS dashboard loaded from mock data. This source will be swapped
          to Supabase table queries in the next phase.
        </div>
      </div>
      <div className="space-y-1">
        <h1 className="font-bold text-3xl">JUTSUS</h1>
        <p className="text-sm text-muted-foreground">
          Role: {profile.role} | Access: {profile.approval_status}
        </p>
      </div>
      <div>
        <JutsusGrid jutsus={jutsusMock} role={profile.role} />
      </div>
    </div>
  );
}
