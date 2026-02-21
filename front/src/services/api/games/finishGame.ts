import { apiClient } from "../client";

const finishGame = (joinToken: string) =>
  apiClient<{ game: unknown }>(
    `games/${joinToken}/finish`,
    { method: "POST", auth: true }
  );

export default finishGame;
