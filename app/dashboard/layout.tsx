import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { requireApprovedProfile } from "@/lib/access-control";
import Link from "next/link";
import { Suspense } from "react";

async function DashboardNav() {
  const profile = await requireApprovedProfile();

  return (
    <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
      <div className="flex gap-5 items-center font-semibold">
        <Link href="/dashboard">Alliance</Link>
        <Link href="/dashboard/updates">Updates</Link>
        <Link href="/dashboard/profile">Profile</Link>
        {profile.role === "KAGE" && (
          <Link href="/dashboard/approvals">[KAGE] Approvals</Link>
        )}
      </div>
      <div className="flex gap-4 items-center">
        <Suspense>
          <ThemeSwitcher />
        </Suspense>
        {!hasEnvVars ? (
          <EnvVarWarning />
        ) : (
          <Suspense>
            <AuthButton />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <Suspense>
            <DashboardNav />
          </Suspense>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5 w-full">
          {children}
        </div>
      </div>
    </main>
  );
}
