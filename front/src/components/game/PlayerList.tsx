import type { Player } from "../../types/game";

interface Props {
  players: Player[];
  myPlayerId?: number;
  showMoney?: boolean;
  onKick?: (player: Player) => void;
}

const PlayerList = ({ players, myPlayerId, showMoney = false, onKick }: Props) => (
  <ul className="list bg-base-100 rounded-box shadow-md">
    <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
      プレイヤー一覧{!showMoney && `（${players.length}名）`}
    </li>
    {players.length === 0 ? (
      <li className="p-4 text-center opacity-50">参加者を待っています...</li>
    ) : (
      players.map(player => (
        <li key={player.id} className="list-row items-center">
          <div className="size-10 rounded-full shadow-sm" style={{ backgroundColor: player.color }} />
          <div className="list-col-grow">
            <div className="font-bold">
              {player.name}
              {myPlayerId !== undefined && player.id === myPlayerId && " (自分)"}
            </div>
            <div className="text-xs uppercase font-semibold opacity-60">
              {player.is_host ? "👑 ホスト" : "プレイヤー"}
            </div>
          </div>
          {showMoney && (
            <div className="font-mono font-bold">
              ${player.money.toLocaleString()}
            </div>
          )}
          {onKick && !player.is_host && player.id !== myPlayerId && (
            <button
              className="btn btn-xs btn-error btn-outline"
              onClick={() => onKick(player)}
            >
              キック
            </button>
          )}
        </li>
      ))
    )}
  </ul>
);

export default PlayerList;
