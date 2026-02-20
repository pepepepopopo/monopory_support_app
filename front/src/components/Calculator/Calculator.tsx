import { useCalculator } from "./useCalculator";

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
}

const Calculator = ({ isOpen, onClose, onConfirm }: CalculatorProps) => {
  const {
    display,
    expression,
    inputDigit,
    inputOperator,
    performCalculation,
    clear,
    calculateAndGetValue,
  } = useCalculator();

  const handleConfirm = () => {
    const value = calculateAndGetValue();
    onConfirm(value);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open" onClick={handleBackdropClick}>
      <div className="modal-box max-w-xs p-4">
        {/* ディスプレイ */}
        <div className="bg-base-200 rounded-lg p-3 mb-3 text-right">
          {/* 計算式（例: 9 + 9 + 9） */}
          <div className="text-sm font-mono opacity-60 h-5 truncate">
            {expression}
          </div>
          {/* 現在の入力値（大きく表示） */}
          <div className="text-2xl font-mono font-bold truncate">
            {display}
          </div>
        </div>

        {/* ボタングリッド */}
        <div className="grid grid-cols-4 gap-2">
          {/* Row 1: C, ÷, ×, − */}
          <button
            type="button"
            className="btn btn-error"
            onClick={clear}
            aria-label="クリア"
          >
            C
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => inputOperator("/")}
            aria-label="除算"
          >
            ÷
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => inputOperator("*")}
            aria-label="乗算"
          >
            ×
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => inputOperator("-")}
            aria-label="減算"
          >
            −
          </button>

          {/* Row 2: 7, 8, 9, + (row span) */}
          <button
            type="button"
            className="btn btn-neutral"
            onClick={() => inputDigit("7")}
          >
            7
          </button>
          <button
            type="button"
            className="btn btn-neutral"
            onClick={() => inputDigit("8")}
          >
            8
          </button>
          <button
            type="button"
            className="btn btn-neutral"
            onClick={() => inputDigit("9")}
          >
            9
          </button>
          <button
            type="button"
            className="btn btn-secondary row-span-2"
            onClick={() => inputOperator("+")}
            aria-label="加算"
          >
            +
          </button>

          {/* Row 3: 4, 5, 6 */}
          <button
            type="button"
            className="btn btn-neutral"
            onClick={() => inputDigit("4")}
          >
            4
          </button>
          <button
            type="button"
            className="btn btn-neutral"
            onClick={() => inputDigit("5")}
          >
            5
          </button>
          <button
            type="button"
            className="btn btn-neutral"
            onClick={() => inputDigit("6")}
          >
            6
          </button>

          {/* Row 4: 1, 2, 3, = (row span) */}
          <button
            type="button"
            className="btn btn-neutral"
            onClick={() => inputDigit("1")}
          >
            1
          </button>
          <button
            type="button"
            className="btn btn-neutral"
            onClick={() => inputDigit("2")}
          >
            2
          </button>
          <button
            type="button"
            className="btn btn-neutral"
            onClick={() => inputDigit("3")}
          >
            3
          </button>

          {/* Row 5: 0 (col span 2), 決定 */}
          <button
            type="button"
            className="btn btn-neutral col-span-2"
            onClick={() => inputDigit("0")}
          >
            0
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleConfirm}
            aria-label="決定"
          >
            決定
          </button>
          <button
            type="button"
            className="btn btn-primary row-span-2"
            onClick={performCalculation}
            aria-label="計算実行"
          >
            =
          </button>
        </div>

        {/* 閉じるボタン */}
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          aria-label="閉じる"
        >
          ✕
        </button>
      </div>
    </dialog>
  );
};

export default Calculator;
