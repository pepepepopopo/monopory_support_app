import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QrCodeModalProps {
  joinUrl: string;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ joinUrl }) => {
  const qrDialogRef = useRef<HTMLDialogElement>(null);

  return(
    <>
      <button
        type='button'
        className='btn btn-square btn-primary'
        onClick={() => qrDialogRef.current?.showModal()}>
          <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
      </button>
      <dialog ref={qrDialogRef} className='modal'>
        <div className="modal-box text-center flex flex-col items-center gap-4">
          <h3 className="font-bold text-lg">参加用QRコード</h3>
          <div className="bg-white p-4 rounded-xl shadow-inner">
            <QRCodeSVG value={joinUrl} size={200} />
          </div>
          <p className="text-sm opacity-70">スキャンしてゲームに参加</p>
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

export default QrCodeModal;