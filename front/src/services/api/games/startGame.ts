import { apiClient } from "../client";

const startGame = (joinToken: string, startMoney: number) =>
  apiClient<{ game: unknown; players: unknown[] }>(
    `games/${joinToken}/start`,
    { method: "POST", auth: true, body: JSON.stringify({ start_money: startMoney }) }
  );

export default startGame;
