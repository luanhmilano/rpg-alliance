import "server-only";

import type { PlayerProfileDto, UpdatePlayerByKageInput } from "@/lib/types/player";
import { playersRepository } from "@/server/repositories/players.repository";

export type { PlayerProfileDto };

class PlayersService {
  async getById(playerId: string): Promise<PlayerProfileDto | null> {
    return playersRepository.getByIdWithRelations(playerId);
  }

  async listForKage(): Promise<PlayerProfileDto[]> {
    return playersRepository.listWithRelations();
  }

  async updateByKage(input: UpdatePlayerByKageInput): Promise<boolean> {
    return playersRepository.updateByKage(input);
  }

  async updatePhone(playerId: string, phone: string | null): Promise<boolean> {
    return playersRepository.updatePhone(playerId, phone);
  }

  async setApprovalForRole(playerId: string, roleId: string, approved: boolean): Promise<boolean> {
    return playersRepository.setApprovalForRole(playerId, roleId, approved);
  }
}

export const playersService = new PlayersService();
