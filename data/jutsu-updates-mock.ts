export type JutsuUpdate = {
  id: string;
  jutsu_id: string;
  jutsu_name: string;
  changed_by_identity: string;
  changed_by_role: string;
  changed_fields: string[];
  created_at: string;
};

export const jutsuUpdatesMock: JutsuUpdate[] = [
  {
    id: "update-001",
    jutsu_id: "jutsu-001",
    jutsu_name: "Shadow Clone Jutsu",
    changed_by_identity: "hokage@rpgalliance.local",
    changed_by_role: "KAGE",
    changed_fields: ["difficulty", "chakra_cost"],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "update-002",
    jutsu_id: "jutsu-002",
    jutsu_name: "Rasengan",
    changed_by_identity: "hokage@rpgalliance.local",
    changed_by_role: "KAGE",
    changed_fields: ["price"],
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "update-003",
    jutsu_id: "jutsu-004",
    jutsu_name: "Chidori",
    changed_by_identity: "sensei@rpgalliance.local",
    changed_by_role: "KAGE",
    changed_fields: ["description", "hand_seals"],
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "update-004",
    jutsu_id: "jutsu-003",
    jutsu_name: "Flying Thunder God",
    changed_by_identity: "hokage@rpgalliance.local",
    changed_by_role: "KAGE",
    changed_fields: ["available_to_roles"],
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "update-005",
    jutsu_id: "jutsu-006",
    jutsu_name: "Primary Lotus",
    changed_by_identity: "taijutsu.master@rpgalliance.local",
    changed_by_role: "KAGE",
    changed_fields: ["rank", "difficulty"],
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "update-006",
    jutsu_id: "jutsu-005",
    jutsu_name: "Tsukuyomi",
    changed_by_identity: "hokage@rpgalliance.local",
    changed_by_role: "KAGE",
    changed_fields: ["price", "chakra_cost", "description"],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
