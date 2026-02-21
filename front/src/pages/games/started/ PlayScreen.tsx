import { useState } from "react";
import { useParams } from "react-router";
import { useToast } from "../../../hooks/useToast";
import { useGameChannel } from "../../../hooks/useGameChannel";
import { useTransfer } from "../../../hooks/useTransfer";
import finishGame from "../../../services/api/games/finishGame";
import Calculator from "../../../components/Calculator/Calculator";
import InterestModal from "../../../components/Modal/InterestModal";
import PlayerList from "../../../components/game/PlayerList";
import TransactionHistory from "../../../components/game/TransactionHistory";

type TabType = 'game' | 'history';

const QUICK_AMOUNTS = [1, 5, 10, 50, 100, 200, 500];

const PlayScreen = () => {
  const { joinToken } = useParams<{ joinToken: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('game');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isInterestOpen, setIsInterestOpen] = useState(false);
  const { showToast } = useToast();

  const myPlayerId = Number(sessionStorage.getItem("playerId"));
  const { players, logs, isHost } = useGameChannel(joinToken, { withLogs: true, myPlayerId });
  const {
    fromBank, setFromBank,
    selectedReceivers, toggleReceiver,
    amount, setAmount,
    isTransferSending, isInterestSending,
    handleTransfer, handleInterest,
  } = useTransfer(joinToken, players, myPlayerId);

  const myPlayer = players.find(p => p.id === myPlayerId);
  const receiverCandidates = fromBank ? players : players.filter(p => p.id !== myPlayerId);

  const handleFinishGame = async () => {
    if (!confirm("ゲームを終了しますか？") || !joinToken) return;
    try {
      await finishGame(joinToken);
    } catch {
      showToast("ゲーム終了に失敗しました", "error");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 自分の残高 */}
        {myPlayer && (
          <div className="bg-base-100 rounded-box shadow p-4 text-center">
            <div className="text-sm opacity-60">{myPlayer.name} の残高</div>
            <div className="text-3xl font-bold">${myPlayer.money.toLocaleString()}</div>
          </div>
        )}

        {/* タブ切り替え */}
        <div role="tablist" className="tabs tabs-boxed">
          <button role="tab" className={`tab ${activeTab === 'game' ? 'tab-active' : ''}`} onClick={() => setActiveTab('game')}>
            ゲーム
          </button>
          <button role="tab" className={`tab ${activeTab === 'history' ? 'tab-active' : ''}`} onClick={() => setActiveTab('history')}>
            取引履歴
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'game' ? (
            <div className="space-y-6">

              {/* 送金フォーム */}
              <div className="bg-base-100 rounded-box shadow-md p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg">送金</div>
                  {isHost && (
                    <button type="button" className="btn btn-sm btn-outline btn-secondary gap-1" onClick={() => setIsInterestOpen(true)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      利息
                    </button>
                  )}
                </div>

                {/* 送金元 */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">送金元</legend>
                  <div className="flex flex-wrap gap-2">
                    {isHost && (
                      <button type="button" className={`btn gap-2 ${fromBank ? 'btn-warning' : 'btn-outline'}`} onClick={() => setFromBank(!fromBank)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="3" y1="22" x2="21" y2="22" />
                          <line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" />
                          <line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" />
                          <polygon points="12 2 20 7 4 7" />
                        </svg>
                        銀行
                      </button>
                    )}
                    {!fromBank && myPlayer && (
                      <div className="btn btn-primary no-animation cursor-default">
                        <div className="size-5 rounded-full" style={{ backgroundColor: myPlayer.color }} />
                        {myPlayer.name}
                      </div>
                    )}
                  </div>
                </fieldset>

                {/* 送金先 */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">送金先（複数選択可）</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {receiverCandidates.map(player => (
                      <button
                        key={player.id}
                        type="button"
                        className={`btn gap-2 ${selectedReceivers.includes(player.id) ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => toggleReceiver(player.id)}
                      >
                        <div className="size-5 rounded-full" style={{ backgroundColor: player.color }} />
                        {player.name}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {/* 金額 */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">金額（1人あたり）</legend>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">$</span>
                    <input
                      type="number"
                      value={amount || ''}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="input input-primary w-full text-lg"
                      min="0"
                      placeholder="0"
                    />
                    <button type="button" className="btn btn-square btn-primary" onClick={() => setIsCalculatorOpen(true)} aria-label="電卓を開く">
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="2" />
                        <line x1="8" y1="6" x2="16" y2="6" />
                        <line x1="8" y1="10" x2="8" y2="10.01" /><line x1="12" y1="10" x2="12" y2="10.01" /><line x1="16" y1="10" x2="16" y2="10.01" />
                        <line x1="8" y1="14" x2="8" y2="14.01" /><line x1="12" y1="14" x2="12" y2="14.01" /><line x1="16" y1="14" x2="16" y2="14.01" />
                        <line x1="8" y1="18" x2="8" y2="18.01" /><line x1="12" y1="18" x2="12" y2="18.01" /><line x1="16" y1="18" x2="16" y2="18.01" />
                      </svg>
                    </button>
                  </div>
                </fieldset>

                {/* クイック入力 */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">クイック入力</legend>
                  <div className="grid grid-cols-4 gap-2">
                    {QUICK_AMOUNTS.map(value => (
                      <button key={value} type="button" className="btn btn-sm btn-outline" onClick={() => setAmount(amount + value)}>
                        +{value}
                      </button>
                    ))}
                    <button type="button" className="btn btn-sm btn-outline btn-error" onClick={() => setAmount(0)}>C</button>
                  </div>
                </fieldset>

                {selectedReceivers.length > 1 && (
                  <div className="text-sm opacity-60">
                    合計: ${(amount * selectedReceivers.length).toLocaleString()}（{selectedReceivers.length}人 × ${amount.toLocaleString()}）
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-block btn-primary"
                  onClick={handleTransfer}
                  disabled={isTransferSending || selectedReceivers.length === 0 || amount <= 0}
                >
                  {isTransferSending ? "送金中..." : `$${amount.toLocaleString()} を送金する`}
                </button>
              </div>

              {/* プレイヤー一覧 */}
              <PlayerList players={players} myPlayerId={myPlayerId} showMoney />

              {/* ゲーム終了（ホストのみ） */}
              {isHost && (
                <button type="button" className="btn btn-block btn-error btn-outline" onClick={handleFinishGame}>
                  ゲームを終了する
                </button>
              )}
            </div>
          ) : (
            <TransactionHistory logs={logs} />
          )}
        </div>
      </div>

      {/* 電卓モーダル */}
      <Calculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} onConfirm={(value) => setAmount(value)} />

      {/* 利息モーダル */}
      <InterestModal
        isOpen={isInterestOpen}
        onClose={() => setIsInterestOpen(false)}
        players={players}
        isSending={isInterestSending}
        onConfirm={async (receivers) => {
          try {
            await handleInterest(receivers);
            setIsInterestOpen(false);
            showToast("利息を支払いました", "success");
          } catch {
            // handleInterest 内で toast 表示済み
          }
        }}
      />
    </div>
  );
};

export default PlayScreen;
