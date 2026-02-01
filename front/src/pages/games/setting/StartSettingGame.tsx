import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import CopyToClipboard from "../../../components/button/CopyToClipboard";
import QrCodeModal from "../../../components/Modal/QrCodeModal";
import GameConsumer from "../../../utils/actionCable";
import usePlayerCleanup from "../../../hooks/usePlayerCleanup";
import type { GameEvent, Player } from "../../../types/game"
import type { Subscription } from "@rails/actioncable";

const StartSettingGame = () => {
  const { joinToken } = useParams<{ joinToken: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [startMoney, setStartMoney] = useState(15000);
  const [isHost, setIsHost] = useState(false);
  const isLeavingRef = useRef(false);
  const subscriptionRef = useRef<Subscription | null>(null);
  const navigate = useNavigate();
  const { cleanupPlayer } = usePlayerCleanup();

  useEffect(()=> {
    // sessionStorageからホスト情報を取得
    const isHostSession = sessionStorage.getItem("isHost") === "true";
    setIsHost(isHostSession);

    if (!joinToken) return;

    const checkGameAndPlayers = async () => {
      try {
        // ゲームのステータスを確認
        const gameResponse = await fetch(`${import.meta.env.VITE_API_BASEURL}games/${joinToken}`);
        if (!gameResponse.ok) {
          // ゲームが存在しない（削除された等）
          sessionStorage.removeItem("playerId");
          sessionStorage.removeItem("isHost");
          navigate("/games", { replace: true });
          return;
        }
        const gameData = await gameResponse.json();
        if (gameData.game?.status === "playing") {
          navigate(`/games/${joinToken}/play`, { replace: true });
          return;
        }

        // プレイヤー一覧を取得
        const playersResponse = await fetch(`${import.meta.env.VITE_API_BASEURL}games/${joinToken}/players`);
        const playersData = await playersResponse.json();
        const playersList = Array.isArray(playersData) ? playersData : [];
        setPlayers(playersList);

        // 自分のプレイヤーが存在するか確認
        const playerId = sessionStorage.getItem("playerId");
        if (playerId && !playersList.some((p: Player) => p.id === Number(playerId))) {
          // プレイヤーが削除されていた場合
          sessionStorage.removeItem("playerId");
          sessionStorage.removeItem("isHost");
          navigate("/games", { replace: true });
          return;
        }
      } catch (error) {
        console.error("ゲーム情報の取得に失敗しました", error);
      }
    };

    checkGameAndPlayers();

    const subscription = GameConsumer.subscriptions.create(
      { channel: "GameChannel", game_id:joinToken },
      {
        connected() {},
        disconnected() {},
        rejected() {},
        received(data: GameEvent){
          if(data.type === "PLAYER_ADDED" ){
            setPlayers(data.all_players);
          } else if(data.type === "PLAYER_REMOVED"){
            setPlayers(data.all_players);
          } else if(data.type === "GAME_STARTED"){
            navigate(`/games/${joinToken}/play`, { replace: true });
          } else if(data.type === "GAME_DELETED"){
            // 自分が退出操作した場合はalertを出さない
            if (!isLeavingRef.current) {
              alert(data.message || "ゲームが終了しました");
              navigate("/games");
            }
          }
        },
      }
    );
    subscriptionRef.current = subscription;
    return () => {
      subscription.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [joinToken]);

  const handleStartGame = async() =>{
    if (!isHost) {
      alert("ホストのみがゲームを開始できます");
      return;
    }

    try {
      // 全プレイヤーの初期資金を設定
      const response = await fetch(`${import.meta.env.VITE_API_BASEURL}games/${joinToken}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ start_money: startMoney })
      });

      if (!response.ok) {
        throw new Error("ゲーム開始に失敗しました");
      }

      navigate(`/games/${joinToken}/play`);
    } catch (error) {
      console.error("ゲーム開始エラー:", error);
      alert("ゲームの開始に失敗しました");
    }
  }

  const handleBack = async() => {
    // 自分の退出操作であることをマーク（GAME_DELETEDのalert防止）
    isLeavingRef.current = true;
    // subscriptionを先に解除してからcleanup
    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = null;
    await cleanupPlayer();
    navigate("/games");
  }

  return(
    <>
      <button onClick={handleBack} className="btn mb-3">
        戻る
      </button>
      <div className="flex flex-col gap-6 rounded-xl border glass px-6 [&:last-child]:pb-6">
        <div className="grid auto-rows-min gap-1.5 pt-6 ">
          <div className="leading-none">ゲームの初期設定を行います</div>
        </div>
        <div className="space-y-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">参加コード</legend>
            <div className="input-group flex gap-2">
              <input
                type="text"
                value={joinToken || ""}
                readOnly
                className="input input-bordered"
              />
              <CopyToClipboard text = {joinToken ?? ""} />
              <QrCodeModal joinUrl= {`${window.location.origin}/games/${joinToken}/join`}/>
            </div>
          </fieldset>
          {isHost && (
            <fieldset className="fieldset">
              <legend className="fieldset-legend">初期資金</legend>
              <input
                type="number"
                value={startMoney}
                onChange={(e) => setStartMoney(Number(e.target.value))}
                className="input input-primary"
                min="0"
                step="1000"
              />
            </fieldset>
          )}
          <ul className="list bg-base-100 rounded-box shadow-md">

            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
              プレイヤーリスト（{players.length}名）
            </li>

            {players.length === 0 ? (
              <li className="p-4 text-center opacity-50">参加者を待っています...</li>
            ) : (
              players.map((player)=> (
                <li key={player.id} className="list-row items-center">
                  <div className="size-10 rounded-full shadow-sm" style={{ backgroundColor: player.color }} />
                  <div className="list-col-grow">
                    <div className="font-bold">{player.name}</div>
                    <div className="text-xs uppercase font-semibold opacity-60">
                      {player.is_host ? "👑 ホスト" : "プレイヤー"}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        {isHost ? (
          <button
            type="button"
            onClick={() => handleStartGame()}
            className="btn btn-block btn-primary">ゲームを開始</button>
        ) : (
          <div className="text-center text-sm opacity-60">
            ホストがゲームを開始するまでお待ちください
          </div>
        )}
      </div>
    </>
  )
}

export default StartSettingGame;