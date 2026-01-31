export interface Player{
  id: number;
  name: string;
  color: string;
  is_host: boolean;
  money: number;
}

export interface LogReceiver {
  player: Pick<Player, "id" | "name" | "color">;
  amount: number;
}

export interface TransactionLog {
  id: number;
  amount: number;
  sender: Pick<Player, "id" | "name" | "color"> | null;
  receivers: LogReceiver[];
  created_at: string;
}

export interface GameEvent{
  type: "PLAYER_ADDED" | "PLAYER_REMOVED" | "GAME_DELETED" | "GAME_STARTED" | "MONEY_TRANSFERRED";
  player?: Player;
  all_players: Player[];
  message?: string;
  log?: TransactionLog;
}