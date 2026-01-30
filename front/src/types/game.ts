export interface Player{
  id: number;
  name: string;
  color: string;
  is_host: boolean;
  money: number;
}

export interface GameEvent{
  type: "PLAYER_ADDED" | "PLAYER_REMOVED" | "GAME_DELETED" | "MONEY_TRANSFERRED";
  player?: Player;
  all_players: Player[];
  message?: string;
}