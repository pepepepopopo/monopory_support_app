import { Link } from "react-router";
import { useParams } from "react-router";
import CopyToClipboard from "../../components/button/CopyToClipboard";

const StartSettingGame = () => {
  const { join_token } = useParams();
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
            <div className="input-group flex">
              <input
                type="text"
                value={join_token || ""}
                readOnly
                className="input input-bordered"
              />
              <CopyToClipboard text = {join_token ?? ""} />
            </div>
          </fieldset>
        </div>
        <button
          type="button"
          className="btn btn-block btn-primary">ゲームを開始</button>
      </div>
    </>
  )
}

export default StartSettingGame;