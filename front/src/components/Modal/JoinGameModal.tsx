import Modal from "./Modal";
import JoinGame from "../../pages/games/JoinGame";

const JoinGameModal = ({ isModalOpen, handleCloseModal
}: {isModalOpen: boolean; handleCloseModal: () => void;}) => {
  return(
    <Modal isModalOpen={isModalOpen} handleCloseModal={handleCloseModal}>
      <JoinGame />
    </Modal>
  )
}

export default JoinGameModal