export interface Player{
  id: number;
  name: string;
  color: string;
  is_host: boolean;
  money: number;
}

export interface GameEvent{
  type: "PLAYER_ADDED" | "MONEY_TRANSFERRED";
  player?: Player;
  all_players: Player[];
}