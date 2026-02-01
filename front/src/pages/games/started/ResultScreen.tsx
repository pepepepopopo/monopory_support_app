import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import type { Player } from "../../../types/game";

const ResultScreen = () => {
  const { joinToken } = useParams<{ joinToken: string }>();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!joinToken) return;

    const fetchPlayers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASEURL}games/${joinToken}/players`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setPlayers([...data].sort((a, b) => b.money - a.money));
        }
      } catch (error) {
        console.error("プレイヤー取得失敗", error);
      }
    };

    fetchPlayers();
  }, [joinToken]);

  const handleBackToTop = () => {
    sessionStorage.removeItem("playerId");
    sessionStorage.removeItem("isHost");
    navigate("/");
  };

  const getRankLabel = (index: number) => {
    if (index === 0) return "1st";
    if (index === 1) return "2nd";
    if (index === 2) return "3rd";
    return `${index + 1}th`;
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold">ゲーム終了</h1>
          <p className="text-sm opacity-60 mt-2">最終結果</p>
        </div>

        {/* 1位を大きく表示 */}
        {players.length > 0 && (
          <div className="bg-base-100 rounded-box shadow-md p-6 text-center">
            <div className="text-sm opacity-60 mb-2">1st Place</div>
            <div
              className="size-16 rounded-full mx-auto mb-3"
              style={{ backgroundColor: players[0].color }}
            />
            <div className="text-2xl font-bold">{players[0].name}</div>
            <div className="text-3xl font-mono font-bold text-primary mt-1">
              ${players[0].money.toLocaleString()}
            </div>
          </div>
        )}

        {/* 全プレイヤー順位 */}
        <ul className="list bg-base-100 rounded-box shadow-md">
          <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
            最終順位
          </li>
          {players.map((player, index) => (
            <li key={player.id} className="list-row items-center">
              <div className={`text-lg font-bold w-12 text-center ${index === 0 ? 'text-warning' : ''}`}>
                {getRankLabel(index)}
              </div>
              <div
                className="size-10 rounded-full shadow-sm"
                style={{ backgroundColor: player.color }}
              />
              <div className="list-col-grow">
                <div className="font-bold">{player.name}</div>
              </div>
              <div className="font-mono font-bold">
                ${player.money.toLocaleString()}
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="btn btn-block btn-primary"
          onClick={handleBackToTop}
        >
          トップに戻る
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
