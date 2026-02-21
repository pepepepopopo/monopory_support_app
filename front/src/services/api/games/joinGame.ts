import { apiClient } from "../client";

const joinGame = (joinToken: string) =>
  apiClient<{ game: { id: number; join_token: string; status: string } }>(
    `games/${joinToken}`
  );

export default joinGame;
