import { Link } from "react-router";

const StartSettingGame = () => {
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
            <legend className="fieldset-legend">ゲームID</legend>
            <input type="text" className="input input-primary" placeholder="名前を入力" />
          </fieldset>
        </div>
        <button
          type="button"
          className="btn btn-block btn-primary">ゲームを作成</button>
      </div>
    </>
  )
}

export default StartSettingGame;