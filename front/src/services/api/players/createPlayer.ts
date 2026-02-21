import { apiClient } from "../client";
import type { Player } from "../../../types/game";

const createPlayer = (gameId: number, name: string, color: string) =>
  apiClient<{ player: Player; token: string }>(
    "players",
    {
      method: "POST",
      body: JSON.stringify({ player: { game_id: gameId, name, color } }),
    }
  );

export default createPlayer;
