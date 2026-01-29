import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import CreatePlayer from "../../services/api/player/createPlayer";
import JoinGame from "../../services/api/games/JoinGame";
import PlayerColor from "../../utils/PlayerColor";
import type { Player } from "../../types/game";


const GameJoin = () =>{
  const [ isHost, _setIsHost ] = useState(false);
  const [ name, setName ] = useState("");
  const [selectedColor, setSelectedColor] = useState(PlayerColor[0]);
  const [ isLoading, setIsLoading ] = useState(false);
  const { joinToken } = useParams<{ joinToken: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const hostPlayer = players.find(p => p.is_host);
  const navigate = useNavigate();

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

  const handleStartGame = async() => {
    if (isLoading) return;
    try{
      if (name.trim() === "") {
        alert("プレイヤー名を入力してください")
        return
      };
      if (!joinToken) {
        alert("ゲーム情報が取得できませんでした");
        return;
      }
      setIsLoading(true);
      const data = await JoinGame(joinToken);
      const gameId = data.game.id
      await CreatePlayer(gameId, name, selectedColor, isHost);
      navigate(`/games/${data.game.join_token}/startSetting`);
    }catch(error){
      alert(`ゲームに参加できませんでした\nゲームが開始されていないことを確認してください`)
      console.error(error)
    }finally{
      setIsLoading(false);
    }
  }

  return(
    <>
      <Link to="/" className="btn mb-3">
        戻る
      </Link>
      <div className="flex flex-col gap-6 rounded-xl border glass px-6 [&:last-child]:pb-6">
        <div className="grid auto-rows-min gap-1.5 pt-6 ">
          <div className="leading-none">ゲームに参加</div>
          <div className="leading-none">{hostPlayer ? `${hostPlayer.name}のゲーム` : "読み込み中.."}</div>
        </div>
        <div className="space-y-2">
          <div className="divider"></div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm">あなたのプレイヤー情報</span>
          </div>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">プレイヤー名</legend>
            <input type="text" onChange={(e) => setName(e.target.value)} className="input input-primary" placeholder="名前を入力" />
          </fieldset>
        </div>
        <div className="space-y-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">カラー選択</legend>
            <div className="grid grid-cols-4 gap-3">
              { PlayerColor.map(color =>{
                const isSelected = selectedColor === color;
                return(
                  <button
                    key={color}
                    type='button'
                    className={`w-full aspect-square rounded-lg transition-all ${
                      isSelected
                        ? 'ring-2 ring-offset-2 scale-110'
                        : 'hover:scale-105 ring-2 ring-border ring-base-200'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                )
              })}
            </div>
          </fieldset>
        </div>
        <button
          type="button"
          onClick={() => handleStartGame()}
          className="btn btn-block btn-primary">{isLoading ? "参加中...":"ゲームに参加"}</button>
      </div>
    </>
  )
}

export default GameJoin;