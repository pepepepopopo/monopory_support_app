import React, { useState } from 'react';
import { Link } from "react-router";

const PLAYER_COLORS = [
  '#ff0000', '#ffa500', '#ffff00', '#008000',
  '#00ffff', '#0000ff', '#800080', '#ff00ff'
];

function NewGame() {
  const [selectedColor, setSelectedColor] = useState(PLAYER_COLORS[0]);
  return(
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="btn mb-3">
          戻る
        </Link>
        <div className="flex flex-col gap-6 rounded-xl border glass px-6 [&:last-child]:pb-6">
          <div className="grid auto-rows-min gap-1.5 pt-6 ">
            <div className="leading-none">新しいゲームを作成</div>
            <div>ゲームの新しいセッションを開始します</div>
          </div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">ゲームタイトル</legend>
              <input type="text" className="input input-primary" placeholder="" />
            </fieldset>
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
                  { PLAYER_COLORS.map(color =>{
                    const isSelected = selectedColor === color;
                    return(
                      <button className={`w-full aspect-square rounded-lg transition-all ${
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
            <button className="btn btn-block btn-primary">ゲームを作成</button>
        </div>
      </div>
    </div>
  );
}

export default NewGame;