import { useState } from "react";
import PlayerColor from '../../utils/PlayerColor';

const PlayerSetting = () => {
  const [selectedColor, setSelectedColor] = useState(PlayerColor[0]);
  return(
    <>
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
    </>
  )
}

export default PlayerSetting;