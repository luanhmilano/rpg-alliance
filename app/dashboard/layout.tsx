import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { requireApprovedProfile } from "@/lib/access-control";
import Link from "next/link";
import { Suspense } from "react";

async function DashboardNav() {
  const profile = await requireApprovedProfile();

  return (
    <div className="w-full max-w-5xl flex justify-between items-center p-2 px-4 md:p-3 md:px-5 text-xs md:text-sm overflow-x-auto">
      <div className="flex gap-2 md:gap-5 items-center font-semibold whitespace-nowrap">
        <Link href="/dashboard">Alliance</Link>
        <Link href="/dashboard/updates">Updates</Link>
        {profile.role === "KAGE" && (
          <>
            <Link href="/dashboard/techniques">Techniques</Link>
            <Link href="/dashboard/kage">[KAGE] Console</Link>
          </>
        )}
      </div>
      <div className="flex gap-4 items-center">
        <Suspense>
          <ThemeSwitcher />
          <AuthButton />
        </Suspense>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <Suspense>
            <DashboardNav />
          </Suspense>
        </nav>
        <div className="flex-1 flex flex-col gap-8 md:gap-12 lg:gap-20 max-w-5xl p-4 md:p-5 w-full">
          {children}
        </div>
      </div>
    </main>
  );
}
