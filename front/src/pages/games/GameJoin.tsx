import { useState } from "react";
import { Link } from "react-router";
import PlayerColor from "../../utils/PlayerColor";

const GameJoin = () =>{
  const [ isHost, setIsHost ] = useState(true);
  const [ name, setName ] = useState("");
  const [selectedColor, setSelectedColor] = useState(PlayerColor[0]);

  return(
    <>
      <Link to="/" className="btn mb-3">
        戻る
      </Link>
      <div className="flex flex-col gap-6 rounded-xl border glass px-6 [&:last-child]:pb-6">
        <div className="grid auto-rows-min gap-1.5 pt-6 ">
          <div className="leading-none">ゲームに参加</div>
        </div>
        <div className="space-y-2">
          <div className="divider"></div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm">あなたのプレイヤー情報</span>
          </div>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">プレイヤー名</legend>
            <input type="text" className="input input-primary" placeholder="名前を入力" />
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
          className="btn btn-block btn-primary">ゲームに参加</button>
      </div>
    </>
  )
}

export default GameJoin;