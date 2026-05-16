import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const alliancePillars = [
  {
    title: "Sunagakure",
    description: "Aldeia da Areia",
  },
  {
    title: "Kirigakure",
    description: "Aldeia da Névoa",
  },
  {
    title: "Konogakure",
    description: "Aldeia da Folha",
  },
];

const featuredClans = ["Uchiha", "Hyuga", "Senju", "Uzumaki"];

async function RootContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  // If already authenticated, redirect to pending or dashboard based on approval status
  if (data?.claims) {
    const { data: profile, error: profileError } = await supabase
      .from("players")
      .select("approved")
      .eq("id", data.claims.sub)
      .single();

    if (!profileError && profile?.approved === true) {
      redirect("/dashboard");
    } else {
      redirect("/pending");
    }
  }

  return (
    <section className="relative isolate w-full overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,hsla(var(--highlight),0.22),transparent_28%),linear-gradient(140deg,hsla(var(--primary),0.15),transparent_45%),linear-gradient(180deg,transparent,hsla(var(--accent),0.09))]" />
      <div className="absolute left-0 top-28 -z-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute right-0 top-12 -z-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 md:px-6 md:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/25 bg-background/75 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary backdrop-blur">
              Aliança Naruto RPG
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-foreground md:text-6xl lg:text-7xl">
                Escolha seu personagem
                <span className="block text-primary">Vire uma lenda</span>
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                RPG de cards baseado em Naruto no WhatsApp.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-11 px-8 text-sm uppercase tracking-[0.22em]"
              >
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 border-primary/30 bg-background/70 px-8 text-sm uppercase tracking-[0.22em]"
              >
                <Link href="/auth/sign-up">Register</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card/80 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Gameplay
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Ganhe Ryos fazendo missões.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card/80 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Jutsus
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Compre jutsus e técnicas do seu personagem.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card/80 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Aliança
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Conheça novas pessoas.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card/85 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between border-b border-border/80 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-primary">
                    Mission Board
                  </p>
                  <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em]">
                    Shinobi status
                  </h2>
                </div>
                <div className="rounded-full bg-highlight px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-black">
                  Rank Up
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-background p-4 ring-1 ring-border">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Clãs
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {featuredClans.map((clan) => (
                      <span
                        key={clan}
                        className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary"
                      >
                        {clan}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
                    <p className="text-xs uppercase tracking-[0.24em] text-primary-foreground/70">
                      Site
                    </p>
                    <p className="mt-3 text-3xl font-black">Gestão</p>
                    <p className="mt-2 text-sm text-primary-foreground/80">
                      Gestão de Ninjas e controle das vilas.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-black p-4 text-white">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                      Pergaminho
                    </p>
                    <p className="mt-3 text-3xl font-black text-highlight">
                      Vários jutsus
                    </p>
                    <p className="mt-2 text-sm text-white/70">
                      Gestão de Jutsus e Técnicas.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-accent/40 bg-accent/10 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-accent-foreground/70">
                    Alliance protocol
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground/80">
                    Crie sua conta e espere a aprovação do respectivo Kage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {alliancePillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-[1.5rem] border border-border/80 bg-card/80 p-6 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-primary">
                Vila Aliada
              </p>
              <h3 className="mt-4 text-2xl font-black uppercase tracking-[-0.04em]">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <nav className="w-full border-b border-b-foreground/10 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 text-sm md:px-6 lg:px-8">
          <div className="flex gap-5 items-center font-semibold">
            <span className="text-base uppercase tracking-[0.2em] text-primary md:text-lg">
              RPG Alliance
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              asChild
              variant="ghost"
              className="hidden sm:inline-flex uppercase tracking-[0.18em]"
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild className="uppercase tracking-[0.18em]">
              <Link href="/auth/sign-up">Register</Link>
            </Button>
            <Suspense>
              <ThemeSwitcher />
            </Suspense>
          </div>
        </div>
      </nav>
      <Suspense
        fallback={
          <div className="mt-8 text-sm text-muted-foreground">Loading...</div>
        }
      >
        <RootContent />
      </Suspense>
    </main>
  );
}
