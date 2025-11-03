import { useRef } from "react";

const JoinGameModal = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return(
    <>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button className="btn btn-primary w-full h-16" onClick={()=>dialogRef.current?.showModal()}>→　ゲームに参加</button>
      <dialog id="my_modal_1" className="modal" ref={dialogRef}>
        <div className="modal-box">
          <form>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">ゲームIDを入力してください</legend>
              <input type="text" className="input input-primary w-full" placeholder="ゲームIDを入力" />
              <button type="submit" className="btn btn-block">参加</button>
            </fieldset>
          </form>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default JoinGameModal;