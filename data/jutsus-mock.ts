export type Jutsu = {
  id: string;
  name: string;
  type: "Ninjutsu" | "Taijutsu" | "Dojutsu" | "Genjutsu";
  rank: "C" | "B" | "A" | "S" | "SS" | "SSS";
  description: string;
  chakraCost: number;
  price: number;
  difficulty: number;
  handSeals: string[];
  availableToRoles: Array<"KAGE" | "MEMBER">;
};

export const jutsusMock: Jutsu[] = [
  {
    id: "jutsu-001",
    name: "Shadow Clone Jutsu",
    type: "Ninjutsu",
    rank: "B",
    description:
      "Creates physical chakra clones to scout, flank, and overwhelm opponents.",
    chakraCost: 30,
    price: 1500,
    difficulty: 5,
    handSeals: ["Ram"],
    availableToRoles: ["KAGE", "MEMBER"],
  },
  {
    id: "jutsu-002",
    name: "Rasengan",
    type: "Ninjutsu",
    rank: "A",
    description:
      "A compressed rotating chakra sphere that delivers a concentrated impact.",
    chakraCost: 45,
    price: 3500,
    difficulty: 7,
    handSeals: [],
    availableToRoles: ["KAGE", "MEMBER"],
  },
  {
    id: "jutsu-003",
    name: "Flying Thunder God",
    type: "Ninjutsu",
    rank: "S",
    description:
      "Instantaneous movement to marked locations using high-level space-time seals.",
    chakraCost: 70,
    price: 8000,
    difficulty: 10,
    handSeals: ["Boar", "Dog", "Bird", "Monkey", "Ram"],
    availableToRoles: ["KAGE"],
  },
  {
    id: "jutsu-004",
    name: "Chidori",
    type: "Ninjutsu",
    rank: "A",
    description:
      "High-speed lightning release thrust focused into a piercing strike.",
    chakraCost: 40,
    price: 3200,
    difficulty: 8,
    handSeals: ["Ox", "Rabbit", "Monkey"],
    availableToRoles: ["KAGE", "MEMBER"],
  },
  {
    id: "jutsu-005",
    name: "Tsukuyomi",
    type: "Genjutsu",
    rank: "S",
    description:
      "A lethal ocular illusion that distorts the target's perception of time.",
    chakraCost: 80,
    price: 9500,
    difficulty: 10,
    handSeals: [],
    availableToRoles: ["KAGE"],
  },
  {
    id: "jutsu-006",
    name: "Primary Lotus",
    type: "Taijutsu",
    rank: "C",
    description:
      "A close-range grappling sequence ending in a high-impact aerial slam.",
    chakraCost: 20,
    price: 800,
    difficulty: 4,
    handSeals: [],
    availableToRoles: ["KAGE", "MEMBER"],
  },
];
