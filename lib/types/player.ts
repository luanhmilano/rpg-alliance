import type { AppRole, ApprovalStatus } from "@/lib/types/common";

/**
 * Public representation of a player profile exposed across service/API layers.
 * Human-readable: role name, village name, character name — no raw FK IDs visible in labels.
 * The roleId/villageId/characterId are kept for administrative form pre-population only.
 */
export type PlayerProfileDto = {
  id: string;
  email: string;
  phone: string | null;
  approved: boolean;
  approvalStatus: ApprovalStatus;
  // Human-readable labels
  role: AppRole;
  villageName: string;
  characterName: string;
  // Internal IDs used by admin edit forms
  roleId: string;
  villageId: string | null;
  characterId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdatePlayerByKageInput = {
  playerId: string;
  roleId: string;
  approved: boolean;
  phone: string | null;
  villageId: string | null;
  characterId: string | null;
};
