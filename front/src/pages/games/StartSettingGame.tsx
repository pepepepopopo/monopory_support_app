import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import CopyToClipboard from "../../components/button/CopyToClipboard";
import QrCodeModal from "../../components/Modal/QrCodeModal";
import GameConsumer from "../../utils/actionCable";
import type { GameEvent, Player } from "../../types/game";

const StartSettingGame = () => {
  const { joinToken } = useParams<{ joinToken: string }>();
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(()=> {
    if (!joinToken) return;

    const fetchInitialPlayers = async () => {
      try {
        // joinTokenを使って、そのゲームのプレイヤー一覧を返すAPIを叩く
        const response = await fetch(`http://localhost:3000/api/games/${joinToken}/players`);
        const data = await response.json();
        setPlayers(data); // 最初に今のメンバーをセット！
      } catch (error) {
        console.error("プレイヤーの取得に失敗しました", error);
      }
    };

    fetchInitialPlayers();

    const subscription = GameConsumer.subscriptions.create(
      { channel: "GameChannel", game_id:joinToken },
      {
        received(data: GameEvent){
          if(data.type === "PLAYER_ADDED" ){
            setPlayers(data.all_players);
          }
        },
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, [joinToken]);
  return(
    <>
      <Link to="/games" className="btn mb-3">
        戻る
      </Link>
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
          className="btn btn-block btn-primary">ゲームを開始</button>
      </div>
    </>
  )
}

export default StartSettingGame;