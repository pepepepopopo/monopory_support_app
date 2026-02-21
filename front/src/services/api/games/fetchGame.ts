import { apiClient } from "../client";

const fetchGame = (joinToken: string) =>
  apiClient<{ game: { id: number; join_token: string; status: string; start_money: number } }>(
    `games/${joinToken}`
  );

export default fetchGame;
