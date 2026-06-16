import { Suspense } from "react";
import { revalidatePath } from "next/cache";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireKageProfile } from "@/lib/access-control";
import { createClient } from "@/lib/supabase/server";
import {
  createCharacterAction,
  createVillageAction,
  deleteCharacterAction,
  deleteVillageAction,
  updateCharacterAction,
  updatePlayerAction,
  updateVillageAction,
} from "./actions";

type OptionRow = { id: string; name: string };

type PlayerRow = {
  id: string;
  email: string;
  phone: string | null;
  approved: boolean;
  roleId: string;
  roleName: string;
  villageId: string | null;
  villageName: string;
  characterId: string | null;
  characterName: string;
};

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
  const { data: memberRole } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "MEMBER")
    .maybeSingle();

  if (!memberRole?.id) return;

  await supabase
    .from("players")
    .update({ approved: status === "APPROVED" })
    .eq("id", profileId)
    .eq("role_id", memberRole.id);

  revalidatePath("/dashboard/kage");
  revalidatePath("/pending");
  revalidatePath("/dashboard");
}

async function KageContent() {
  const profile = await requireKageProfile();
  const supabase = await createClient();

  const [playersResult, villagesResult, charactersResult, rolesResult] =
    await Promise.all([
      supabase
        .from("players")
        .select(
          "id,email,phone,approved,role_id,village_id,character_id,roles(name),villages(name),characters(name)",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("villages")
        .select("id,name")
        .order("name", { ascending: true }),
      supabase
        .from("characters")
        .select("id,name,avatar_url")
        .order("name", { ascending: true }),
      supabase
        .from("roles")
        .select("id,name")
        .order("name", { ascending: true }),
    ]);

  const players: PlayerRow[] =
    playersResult.data?.map((player) => ({
      id: player.id,
      email: player.email ?? "",
      phone: player.phone,
      approved: Boolean(player.approved),
      roleId: player.role_id,
      roleName: (player.roles as { name?: string } | null)?.name ?? "MEMBER",
      villageId: player.village_id,
      villageName: (player.villages as { name?: string } | null)?.name ?? "—",
      characterId: player.character_id,
      characterName:
        (player.characters as { name?: string } | null)?.name ?? "—",
    })) ?? [];

  const villages = (villagesResult.data ?? []) as OptionRow[];
  const characters = (charactersResult.data ?? []) as Array<{
    id: string;
    name: string;
    avatar_url: string | null;
  }>;
  const roles = (rolesResult.data ?? []) as OptionRow[];

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          KAGE Console
        </p>
        <h1 className="text-3xl font-bold">Gestão administrativa</h1>
        <p className="text-sm text-muted-foreground">
          Role: {profile.role} | Access: {profile.approval_status}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryItem label="Jogadores" value={String(players.length)} />
        <SummaryItem label="Vilas" value={String(villages.length)} />
        <SummaryItem label="Personagens" value={String(characters.length)} />
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Aprovações pendentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Revisão de novos membros movida para o console do KAGE.
            </p>
            <PendingApprovalsTable action={updateApprovalStatus} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Jogadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {players.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum jogador encontrado.
              </p>
            ) : (
              <div className="grid gap-4">
                {players.map((player) => (
                  <Card key={player.id} className="border-border/60">
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {player.email || player.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Vila: {player.villageName} · Personagem:{" "}
                            {player.characterName}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={player.approved ? "default" : "secondary"}
                          >
                            {player.approved ? "APPROVED" : "PENDING"}
                          </Badge>
                          <Badge variant="outline">{player.roleName}</Badge>
                        </div>
                      </div>

                      <form
                        action={updatePlayerAction}
                        className="grid gap-3 lg:grid-cols-[1.1fr_1fr_1fr_1fr_1fr_auto]"
                      >
                        <input
                          type="hidden"
                          name="playerId"
                          value={player.id}
                        />

                        <div className="space-y-1">
                          <Label className="text-xs">Role</Label>
                          <select
                            name="roleId"
                            defaultValue={player.roleId}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Status</Label>
                          <select
                            name="approved"
                            defaultValue={String(player.approved)}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="true">APPROVED</option>
                            <option value="false">PENDING</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Vila</Label>
                          <select
                            name="villageId"
                            defaultValue={player.villageId ?? ""}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">Sem vila</option>
                            {villages.map((village) => (
                              <option key={village.id} value={village.id}>
                                {village.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Personagem</Label>
                          <select
                            name="characterId"
                            defaultValue={player.characterId ?? ""}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">Sem personagem</option>
                            {characters.map((character) => (
                              <option key={character.id} value={character.id}>
                                {character.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Telefone</Label>
                          <Input
                            name="phone"
                            defaultValue={player.phone ?? ""}
                            placeholder="(11) 99999-9999"
                          />
                        </div>

                        <div className="flex items-end">
                          <Button type="submit" className="w-full" size="sm">
                            Salvar
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vilas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              action={createVillageAction}
              className="grid gap-3 md:grid-cols-[1fr_auto]"
            >
              <Input name="name" placeholder="Nova vila" required />
              <Button type="submit">Adicionar</Button>
            </form>

            <div className="space-y-3">
              {villages.map((village) => (
                <form
                  key={village.id}
                  action={updateVillageAction}
                  className="grid gap-3 md:grid-cols-[1fr_auto_auto]"
                >
                  <input type="hidden" name="villageId" value={village.id} />
                  <Input name="name" defaultValue={village.name} required />
                  <Button type="submit" variant="outline">
                    Editar
                  </Button>
                  <Button
                    type="submit"
                    formAction={deleteVillageAction}
                    variant="destructive"
                  >
                    Remover
                  </Button>
                </form>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              action={createCharacterAction}
              className="grid gap-3 md:grid-cols-2"
            >
              <Input name="name" placeholder="Novo personagem" required />
              <Input name="avatarUrl" placeholder="Avatar URL" />
              <div className="md:col-span-2">
                <Button type="submit">Adicionar</Button>
              </div>
            </form>

            <div className="space-y-3">
              {characters.map((character) => (
                <form
                  key={character.id}
                  action={updateCharacterAction}
                  className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]"
                >
                  <input
                    type="hidden"
                    name="characterId"
                    value={character.id}
                  />
                  <Input name="name" defaultValue={character.name} required />
                  <Input
                    name="avatarUrl"
                    defaultValue={character.avatar_url ?? ""}
                    placeholder="Avatar URL"
                  />
                  <Button type="submit" variant="outline">
                    Editar
                  </Button>
                  <Button
                    type="submit"
                    formAction={deleteCharacterAction}
                    variant="destructive"
                  >
                    Remover
                  </Button>
                </form>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

async function PendingApprovalsTable({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const supabase = await createClient();
  const { data: pendingProfiles, error } = await supabase
    .from("players")
    .select("id,email,phone,role_id,approved,created_at,roles(name)")
    .eq("approved", false)
    .order("created_at", { ascending: true });

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  if (!pendingProfiles || pendingProfiles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No pending users right now.
      </p>
    );
  }

  return (
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
              <td className="py-3 pr-4">
                {profile.roles?.[0]?.name ?? profile.role_id ?? "MEMBER"}
              </td>
              <td className="py-3 pr-4">
                {profile.approved ? "APPROVED" : "PENDING"}
              </td>
              <td className="py-3 pr-4">
                {new Date(profile.created_at).toLocaleString()}
              </td>
              <td className="py-3">
                <div className="flex flex-wrap gap-2">
                  <form action={action}>
                    <input type="hidden" name="profileId" value={profile.id} />
                    <input type="hidden" name="status" value="APPROVED" />
                    <button
                      className="rounded border px-3 py-1 text-xs hover:bg-accent"
                      type="submit"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={action}>
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
  );
}

function SummaryItem({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function KagePage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">
          Loading KAGE console...
        </div>
      }
    >
      <KageContent />
    </Suspense>
  );
}
