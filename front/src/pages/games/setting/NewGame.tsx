import { useState } from "react";
import { Link, useNavigate } from "react-router";
import CreateGame from '../../../services/api/games/createGame';
import PlayerColor from "../../../utils/PlayerColor";
import CreatePlayer from "../../../services/api/player/createPlayer";
import { setToken } from "../../../utils/auth";

const NAME_MAX_LENGTH = 20;

const NewGame = () => {
  const [ name, setName ] = useState("");
  const [selectedColor, setSelectedColor] = useState(PlayerColor[0]);
  const [ isLoading, setIsLoading ] = useState(false);
  const navigate = useNavigate();

  const handleStartGame = async() => {
    if (isLoading) return;
    if (name.trim() === "") {
      alert("プレイヤー名を入力してください");
      return;
    }

    setIsLoading(true);
    try{
      const data = await CreateGame(15000);
      const gameId = data.game.id
      const result = await CreatePlayer(gameId, name.trim(), selectedColor);

      sessionStorage.setItem("playerId", result.player.id.toString());
      sessionStorage.setItem("isHost", "true");
      setToken(result.token);

      navigate(`/games/${data.game.join_token}/startSetting`);
    }catch(e){
      alert(e instanceof Error ? e.message : "ゲームの作成に失敗しました");
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
          <div className="leading-none">新しいゲームを作成</div>
        </div>
        <div className="space-y-2">
          <div className="divider"></div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm">あなたのプレイヤー情報</span>
          </div>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">プレイヤー名</legend>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-primary"
              placeholder="名前を入力"
              maxLength={NAME_MAX_LENGTH}
            />
            <div className="text-xs opacity-60 mt-1">
              {name.length}/{NAME_MAX_LENGTH}文字
            </div>
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
          className="btn btn-block btn-primary">{isLoading ? "作成中...":"ゲームを作成"}</button>
      </div>
    </>
  );
}

export default NewGame;
