import { Link, useNavigate } from "react-router";
import CreateGame from '../../services/api/games/createGame';
import PlayerSetting from '../../components/select/PlayerSetting';

const NewGame = () => {
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    const data = await CreateGame();
    if (data?.game?.id) {
      navigate(`/games/${data.game.join_token}/startSetting`);
    }
  };

  return(
    <>
      <Link to="/" className="btn mb-3">
        戻る
      </Link>
      <div className="flex flex-col gap-6 rounded-xl border glass px-6 [&:last-child]:pb-6">
        <div className="grid auto-rows-min gap-1.5 pt-6 ">
          <div className="leading-none">新しいゲームを作成</div>
        </div>
        <PlayerSetting />
        <button
          type="button"
          onClick={handleCreateGame}
          className="btn btn-block btn-primary">ゲームを作成</button>
      </div>
    </>
  );
}

export default NewGame;
