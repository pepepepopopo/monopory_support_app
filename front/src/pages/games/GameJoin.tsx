import { Link } from "react-router";
import PlayerSetting from "../../components/select/PlayerSetting";


const GameJoin = () =>{
  return(
    <>
      <Link to="/" className="btn mb-3">
        戻る
      </Link>
      <div className="flex flex-col gap-6 rounded-xl border glass px-6 [&:last-child]:pb-6">
        <div className="grid auto-rows-min gap-1.5 pt-6 ">
          <div className="leading-none">ゲームに参加</div>
        </div>
        <PlayerSetting />
        <button
          type="button"
          className="btn btn-block btn-primary">ゲームに参加</button>
      </div>
    </>
  )
}

export default GameJoin;