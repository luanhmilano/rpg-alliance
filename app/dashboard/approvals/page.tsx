import { Suspense } from "react";
import { redirect } from "next/navigation";

export default function DashboardApprovalsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">
          Loading approvals...
        </div>
      }
    >
      {redirect("/dashboard/kage")}
    </Suspense>
  );
}
