const Modal = ({ isModalOpen, handleCloseModal, children
}: {isModalOpen: boolean; handleCloseModal: () => void; children: React.ReactNode;}) => {
  if(!isModalOpen){
    return <></>;
  }

  return (
    <div>
      <button onClick={handleCloseModal}>閉じる</button>
      {children}
    </div>
  )
};

export default Modal