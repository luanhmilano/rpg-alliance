import { Suspense } from "react";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile, requireAuthenticatedUser } from "@/lib/access-control";

export default function PendingPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Carregando status...</div>}>
      <PendingContent />
    </Suspense>
  );
}

async function PendingContent() {
  await requireAuthenticatedUser();
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.approval_status === "APPROVED") {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Account waiting for KAGE approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Your account is authenticated, but access to the dashboard is blocked
            until a KAGE approves it.
          </p>
          <p>
            Current status:{" "}
            <span className="font-semibold">{profile.approval_status}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
