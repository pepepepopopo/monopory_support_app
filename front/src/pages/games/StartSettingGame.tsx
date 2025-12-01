import { Link } from "react-router";
import { useParams } from "react-router";
import CopyToClipboard from "../../components/button/CopyToClipboard";

const StartSettingGame = () => {
  const { joinToken } = useParams();
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
                value={joinToken || ""}
                readOnly
                className="input input-bordered"
              />
              <CopyToClipboard text = {joinToken ?? ""} />
            </div>
          </fieldset>
          <ul className="list bg-base-100 rounded-box shadow-md">

            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">プレイヤーリスト</li>

            <li className="list-row">
              <div className="text-4xl font-thin opacity-30 tabular-nums">color</div>
              <div><img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/1@94.webp"/></div>
              <div className="list-col-grow">
                <div>name</div>
                <div className="text-xs uppercase font-semibold opacity-60">role</div>
              </div>
              <button className="btn btn-square btn-ghost">
                <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
              </button>
            </li>
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