import { useState } from 'react';
import { Link } from "react-router";
import JoinGameModal from '../components/Modal/JoinGameModal';
import '../styles/App.css'

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen((isModalOpen) => !isModalOpen)
  }

  const dialogElement = document.getElementById("my_modal_1") as HTMLDialogElement | null;

  return (
    <>
      <div className="text-center mb-12 mt-20">
        <h1 className="mb-2 text-primary-content">🎲 モノポリー資産管理</h1>
        <p className="text-primary-content">銀行役からオサラバ！</p>
      </div>
      <div className="grid gap-4">
        <Link to="/games" className="btn btn-primary w-full h-16">
          <span className="mr-2 text-lg">+</span>
          新しいゲームを作成
        </Link>
        <JoinGameModal isModalOpen={isModalOpen} handleCloseModal={handleCloseModal} />
        <button onClick={() => setIsModalOpen(true)} className="btn btn-secondary w-full h-16">
          ゲームに参加
        </button>
        {/* Open the modal using document.getElementById('ID').showModal() method */}
        <button className="btn" onClick={()=>dialogElement?.showModal()}>open modal</button>
        <dialog id="my_modal_1" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Hello!</h3>
            <p className="py-4">Press ESC key or click the button below to close</p>
            <div className="modal-action">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </>
  )
}

export default Home
