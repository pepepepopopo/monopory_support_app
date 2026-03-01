import { apiClient } from "../client";

const deletePlayer = (playerId: number) =>
  apiClient<{ message: string }>(`players/${playerId}`, {
    method: "DELETE",
    auth: true,
  });

export default deletePlayer;
