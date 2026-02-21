import { apiClient } from "../client";
import type { Player } from "../../../types/game";

const fetchPlayers = (joinToken: string) =>
  apiClient<Player[]>(`games/${joinToken}/players`);

export default fetchPlayers;
