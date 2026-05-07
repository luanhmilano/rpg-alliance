import { Suspense } from "react";
import { revalidatePath } from "next/cache";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireKageProfile } from "@/lib/access-control";
import { createClient } from "@/lib/supabase/server";

async function updateApprovalStatus(formData: FormData) {
  "use server";

  await requireKageProfile();

  const profileId = formData.get("profileId");
  const status = formData.get("status");

  if (typeof profileId !== "string") {
    return;
  }

  if (status !== "APPROVED" && status !== "REJECTED") {
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ approval_status: status })
    .eq("id", profileId)
    .eq("role", "MEMBER");

  revalidatePath("/dashboard/approvals");
  revalidatePath("/pending");
  revalidatePath("/dashboard");
}

export default function DashboardApprovalsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading approvals...</div>}>
      <ApprovalsContent />
    </Suspense>
  );
}

async function ApprovalsContent() {
  await requireKageProfile();

  const supabase = await createClient();
  const { data: pendingProfiles, error } = await supabase
    .from("profiles")
    .select("id,email,phone,role,approval_status,created_at")
    .eq("approval_status", "PENDING")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending approvals</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-destructive">
          Failed to load pending users: {error.message}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Pending approvals</h1>
        <p className="text-sm text-muted-foreground mt-2">
          This is the KAGE review queue for new users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users waiting for access</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingProfiles && pendingProfiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4">Identity</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProfiles.map((profile) => (
                    <tr className="border-b" key={profile.id}>
                      <td className="py-3 pr-4">
                        {profile.email ?? profile.phone ?? profile.id}
                      </td>
                      <td className="py-3 pr-4">{profile.role}</td>
                      <td className="py-3 pr-4">{profile.approval_status}</td>
                      <td className="py-3 pr-4">
                        {new Date(profile.created_at).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <form action={updateApprovalStatus}>
                            <input type="hidden" name="profileId" value={profile.id} />
                            <input type="hidden" name="status" value="APPROVED" />
                            <button
                              className="rounded border px-3 py-1 text-xs hover:bg-accent"
                              type="submit"
                            >
                              Approve
                            </button>
                          </form>
                          <form action={updateApprovalStatus}>
                            <input type="hidden" name="profileId" value={profile.id} />
                            <input type="hidden" name="status" value="REJECTED" />
                            <button
                              className="rounded border px-3 py-1 text-xs hover:bg-accent"
                              type="submit"
                            >
                              Reject
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No pending users right now.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
