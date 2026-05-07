import { Suspense } from "react";
import { headers } from "next/headers";

import { JutsusGrid } from "@/components/jutsus/jutsus-grid";
import { requireApprovedProfile } from "@/lib/access-control";
import type { JutsuModel } from "@/lib/jutsus/query-parser";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
async function DashboardContent() {
  const profile = await requireApprovedProfile();
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  const baseUrl = host ? `${protocol}://${host}` : "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/jutsus`, {
    cache: "no-store",
  });

  let jutsus: JutsuModel[] = [];

  if (response.ok) {
    const payload = (await response.json()) as { data?: JutsuModel[] };
    jutsus = payload.data ?? [];
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="w-full">
      </div>
      <div className="space-y-1">
        <h1 className="font-bold text-3xl">JUTSUS</h1>
        <p className="text-sm text-muted-foreground">
          Role: {profile.role} | Access: {profile.approval_status}
        </p>
      </div>
      <div>
        <JutsusGrid jutsus={jutsus} role={profile.role} />
      </div>
    </div>
  );
}
