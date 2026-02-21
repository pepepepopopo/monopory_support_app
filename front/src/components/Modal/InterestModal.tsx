import { useState } from "react";
import type { Player } from "../../types/game";

interface InterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onConfirm: (receivers: { player_id: number; amount: number }[]) => void;
  isSending: boolean;
}

const InterestModal = ({ isOpen, onClose, players, onConfirm, isSending }: InterestModalProps) => {
  const [rate, setRate] = useState<number | "">("");

  const rateValue = typeof rate === "number" ? rate : 0;

  const interestList = players.map(p => ({
    player: p,
    amount: rateValue > 0 ? Math.ceil(p.money * rateValue / 100) : 0,
  }));

  const receivers = interestList
    .filter(item => item.amount > 0)
    .map(item => ({ player_id: item.player.id, amount: item.amount }));

  const totalInterest = receivers.reduce((sum, r) => sum + r.amount, 0);

  const handleConfirm = () => {
    if (receivers.length === 0) return;
    onConfirm(receivers);
  };

  const handleClose = () => {
    setRate("");
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open" onClick={handleBackdropClick}>
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-lg mb-4">利息の支払い</h3>

        {/* 利率入力 */}
        <fieldset className="fieldset mb-4">
          <legend className="fieldset-legend">利率</legend>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={rate === "" ? "" : rate}
              onChange={(e) => {
                const v = e.target.value;
                setRate(v === "" ? "" : parseInt(v, 10));
              }}
              className="input input-primary w-full text-lg"
              min="0"
              step="1"
              placeholder="0"
            />
            <span className="text-lg font-bold">%</span>
          </div>
        </fieldset>

        {/* プレビューテーブル */}
        {rateValue > 0 && (
          <div className="overflow-x-auto mb-4">
            <table className="table table-sm w-full">
              <thead>
                <tr>
                  <th>プレイヤー</th>
                  <th className="text-right">残高</th>
                  <th className="text-right">利息</th>
                </tr>
              </thead>
              <tbody>
                {interestList.map(({ player, amount }) => (
                  <tr key={player.id}>
                    <td className="flex items-center gap-2">
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: player.color }}
                      />
                      {player.name}
                    </td>
                    <td className="text-right font-mono">${player.money.toLocaleString()}</td>
                    <td className="text-right font-mono font-bold text-primary">
                      {amount > 0 ? `+$${amount.toLocaleString()}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={2}>合計</td>
                  <td className="text-right font-mono text-primary">${totalInterest.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 支払いボタン */}
        <button
          type="button"
          className="btn btn-block btn-primary"
          onClick={handleConfirm}
          disabled={isSending || receivers.length === 0 || rateValue <= 0}
        >
          {isSending ? "支払い中..." : `利息を支払う（$${totalInterest.toLocaleString()}）`}
        </button>

        {/* 閉じるボタン */}
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={handleClose}
          aria-label="閉じる"
        >
          ✕
        </button>
      </div>
    </dialog>
  );
};

export default InterestModal;
