import { AuthHub } from "@/components/auth-hub";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function RootContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  // If already authenticated, redirect to pending or dashboard based on approval status
  if (data?.claims) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("approval_status")
      .eq("id", data.claims.sub)
      .single();

    if (!profileError && profile?.approval_status === "APPROVED") {
      redirect("/dashboard");
    } else {
      redirect("/pending");
    }
  }

  // Not authenticated - show auth hub
  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 md:p-6 lg:p-10">
      <AuthHub />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-4 md:px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <span className="text-base md:text-lg">RPG Alliance</span>
          </div>
          <Suspense>
            <ThemeSwitcher />
          </Suspense>
        </div>
      </nav>
      <Suspense fallback={<div className="text-sm text-muted-foreground mt-8">Loading...</div>}>
        <RootContent />
      </Suspense>
    </main>
  );
}
