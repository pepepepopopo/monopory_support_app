import { apiClient } from "../client";

const createGame = (startMoney: number) =>
  apiClient<{ game: { id: number; join_token: string; start_money: number } }>(
    "games",
    { method: "POST", body: JSON.stringify({ game: { start_money: startMoney } }) }
  );

export default createGame;
