import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import CopyToClipboard from "../../../components/button/CopyToClipboard";
import QrCodeModal from "../../../components/Modal/QrCodeModal";
import GameConsumer from "../../../utils/actionCable";
import usePlayerCleanup from "../../../hooks/usePlayerCleanup";
import type { GameEvent, Player } from "../../../types/game"

const StartSettingGame = () => {
  const { joinToken } = useParams<{ joinToken: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const navigate = useNavigate();
  const { cleanupPlayer } = usePlayerCleanup();

  useEffect(()=> {
    console.log("🎮 StartSettingGameマウント時のsessionStorage:", {
      playerId: sessionStorage.getItem("playerId"),
      isHost: sessionStorage.getItem("isHost")
    });

    if (!joinToken) return;

    const fetchInitialPlayers = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/games/${joinToken}/players`);
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error("プレイヤーの取得に失敗しました", error);
      }
    };

    fetchInitialPlayers();

    const subscription = GameConsumer.subscriptions.create(
      { channel: "GameChannel", game_id:joinToken },
      {
        connected() {
          console.log("✅ ActionCable接続成功 - GameChannel:", joinToken);
        },
        disconnected() {
          console.log("❌ ActionCable切断 - GameChannel:", joinToken);
          console.warn("⚠️ ActionCableが切断されました。画面をリロードしてください。");
        },
        rejected() {
          console.error("🚫 ActionCable接続拒否 - GameChannel:", joinToken);
        },
        received(data: GameEvent){
          console.log("📩 ActionCableイベント受信:", data);
          if(data.type === "PLAYER_ADDED" ){
            console.log("👤 PLAYER_ADDED イベント - プレイヤーリスト更新:", data.all_players);
            setPlayers(data.all_players);
          } else if(data.type === "PLAYER_REMOVED"){
            // プレイヤーが退出した時、リストを更新
            console.log("👋 PLAYER_REMOVED イベント - プレイヤーリスト更新:", data.all_players);
            setPlayers(data.all_players);
          } else if(data.type === "GAME_DELETED"){
            // ホストが退出してゲームが削除された時
            console.log("🗑️ GAME_DELETED イベント受信");
            alert(data.message || "ゲームが終了しました");
            navigate("/games");
          }
        },
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, [joinToken]);

  const handleStartGame = async() =>{
    navigate(`/games/${joinToken}/play`);
  }

  const handleBack = async() => {
    // プレイヤーをゲームから削除
    await cleanupPlayer();
    // トップページへ戻る
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
        <button
          type="button"
          onClick={() => handleStartGame()}
          className="btn btn-block btn-primary">ゲームを開始</button>
      </div>
    </>
  )
}

export default StartSettingGame;