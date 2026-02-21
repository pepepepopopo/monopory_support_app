import { useState,useRef } from "react";
import { useNavigate } from "react-router";
import joinGame from "../../services/api/games/joinGame";

const JoinGameModal = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [ inputJoinToken, setInputJoinToken] = useState<string>("");
  const navigate = useNavigate();
  const handleJoinGame = async(e: React.MouseEvent<HTMLButtonElement>) =>{
    e.preventDefault();
    const trimmedJoinToken = inputJoinToken.trim();
    const data = await joinGame(trimmedJoinToken)
    if(data?.game?.join_token){
      navigate(`/games/${data.game.join_token}/join`);
    }
  }

  return(
    <>
      <button className="btn btn-primary w-full h-16" onClick={()=>dialogRef.current?.showModal()}>→　ゲームに参加</button>
      <dialog id="my_modal_1" className="modal" ref={dialogRef}>
        <div className="modal-box">
          <form>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">ゲームIDを入力してください</legend>
              <input
                type="text"
                className="input input-primary w-full"
                placeholder="ゲームIDを入力"
                value={inputJoinToken}
                onChange={ (e) => setInputJoinToken(e.target.value)}
                />
              <button type="submit" onClick={handleJoinGame} className="btn btn-block">参加</button>
            </fieldset>
          </form>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default JoinGameModal;