import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getGameConsumer } from "../../../utils/actionCable";
import { getToken, getTokenPayload, getAuthHeaders } from "../../../utils/auth";
import { useToast } from "../../../hooks/useToast";
import type { GameEvent, Player, TransactionLog } from "../../../types/game";
import type { Consumer } from "@rails/actioncable";
import Calculator from "../../../components/Calculator/Calculator";
import InterestModal from "../../../components/Modal/InterestModal";

type TabType = 'game' | 'history';

const QUICK_AMOUNTS = [1, 5, 10, 50, 100, 200, 500];

const PlayScreen = () => {
  const { joinToken } = useParams<{ joinToken: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('game');
  const [players, setPlayers] = useState<Player[]>([]);
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const consumerRef = useRef<Consumer | null>(null);

  // 送金フォーム
  const [fromBank, setFromBank] = useState(false);
  const [selectedReceivers, setSelectedReceivers] = useState<number[]>([]);
  const [amount, setAmount] = useState(0);

  // 電卓モーダル
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // 利息モーダル
  const [isInterestOpen, setIsInterestOpen] = useState(false);

  const { showToast } = useToast();
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const myPlayerId = Number(sessionStorage.getItem("playerId"));
  const myPlayer = players.find(p => p.id === myPlayerId);

  useEffect(() => {
    const payload = getTokenPayload();
    if (payload) {
      setIsHost(payload.is_host);
    }

    if (!joinToken) return;

    const token = getToken();
    if (!token) {
      navigate("/games", { replace: true });
      return;
    }

    // プレイヤー一覧取得
    const fetchPlayers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}games/${joinToken}/players`);
        const data = await res.json();
        if (Array.isArray(data)) setPlayers(data);
      } catch {
        // ignore
      }
    };

    // 取引履歴取得
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}games/${joinToken}/logs`, {
          headers: { ...getAuthHeaders() },
        });
        const data = await res.json();
        if (Array.isArray(data)) setLogs(data);
      } catch {
        // ignore
      }
    };

    fetchPlayers();
    fetchLogs();

    const consumer = getGameConsumer(token);
    consumerRef.current = consumer;

    const subscription = consumer.subscriptions.create(
      { channel: "GameChannel", game_id: joinToken },
      {
        connected() {},
        disconnected() {},
        rejected() {},
        received(data: GameEvent) {
          if (data.type === "MONEY_TRANSFERRED") {
            setPlayers(data.all_players);
            if (data.log) {
              setLogs(prev => [data.log!, ...prev]);
              // 送金/受金通知
              const log = data.log;
              const myId = Number(sessionStorage.getItem("playerId"));
              const myReceive = log.receivers.find(r => r.player.id === myId);
              if (myReceive) {
                const senderName = log.sender?.name ?? "銀行";
                showToastRef.current(`${senderName}から $${myReceive.amount.toLocaleString()} を受け取りました`, "info");
              } else if (log.sender?.id === myId) {
                showToastRef.current(`$${log.amount.toLocaleString()} を送金しました`, "success");
              }
            }
          }
          if (data.type === "GAME_FINISHED") {
            navigate(`/games/${joinToken}/result`);
          }
        },
      }
    );

    return () => {
      subscription.unsubscribe();
      consumer.disconnect();
      consumerRef.current = null;
    };
  }, [joinToken]);

  const toggleReceiver = (playerId: number) => {
    setSelectedReceivers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleTransfer = async () => {
    if (selectedReceivers.length === 0 || amount <= 0) {
      showToast("送金先と金額を入力してください", "error");
      return;
    }

    const senderPlayerId = fromBank ? null : myPlayerId;

    // 残高チェック（銀行以外）
    if (!fromBank && myPlayer && myPlayer.money < amount * selectedReceivers.length) {
      showToast("残高が不足しています", "error");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}games/${joinToken}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          sender_player_id: senderPlayerId,
          receivers: selectedReceivers.map(id => ({
            player_id: id,
            amount: amount,
          })),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "送金に失敗しました");
      }

      // フォームリセット
      setSelectedReceivers([]);
      setAmount(0);
      setFromBank(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "送金に失敗しました", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleFinishGame = async () => {
    if (!confirm("ゲームを終了しますか？")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}games/${joinToken}/finish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });
      if (!res.ok) {
        throw new Error("ゲーム終了に失敗しました");
      }
    } catch {
      showToast("ゲーム終了に失敗しました", "error");
    }
  };

  // 送金元として表示しないプレイヤー（自分 or 銀行モードなら全員が送金先候補）
  const receiverCandidates = fromBank
    ? players
    : players.filter(p => p.id !== myPlayerId);

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
          <button
            role="tab"
            className={`tab ${activeTab === 'game' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('game')}
          >
            ゲーム
          </button>
          <button
            role="tab"
            className={`tab ${activeTab === 'history' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            取引履歴
          </button>
        </div>

        {/* メインコンテンツ */}
        <div className="mt-4">
          {activeTab === 'game' ? (
            <div className="space-y-6">

              {/* 送金フォーム */}
              <div className="bg-base-100 rounded-box shadow-md p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg">送金</div>
                  {isHost && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline btn-secondary gap-1"
                      onClick={() => setIsInterestOpen(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      利息
                    </button>
                  )}
                </div>

                {/* 送金元の選択 */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">送金元</legend>
                  <div className="flex flex-wrap gap-2">
                    {isHost && (
                      <button
                        type="button"
                        className={`btn gap-2 ${fromBank ? 'btn-warning' : 'btn-outline'}`}
                        onClick={() => setFromBank(!fromBank)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="3" y1="22" x2="21" y2="22" />
                          <line x1="6" y1="18" x2="6" y2="11" />
                          <line x1="10" y1="18" x2="10" y2="11" />
                          <line x1="14" y1="18" x2="14" y2="11" />
                          <line x1="18" y1="18" x2="18" y2="11" />
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

                {/* 送金先選択 */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">送金先（複数選択可）</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {receiverCandidates.map(player => {
                      const isSelected = selectedReceivers.includes(player.id);
                      return (
                        <button
                          key={player.id}
                          type="button"
                          className={`btn gap-2 ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => toggleReceiver(player.id)}
                        >
                          <div className="size-5 rounded-full" style={{ backgroundColor: player.color }} />
                          {player.name}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* 金額入力 */}
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
                    <button
                      type="button"
                      className="btn btn-square btn-primary"
                      onClick={() => setIsCalculatorOpen(true)}
                      aria-label="電卓を開く"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="4" y="2" width="16" height="20" rx="2" />
                        <line x1="8" y1="6" x2="16" y2="6" />
                        <line x1="8" y1="10" x2="8" y2="10.01" />
                        <line x1="12" y1="10" x2="12" y2="10.01" />
                        <line x1="16" y1="10" x2="16" y2="10.01" />
                        <line x1="8" y1="14" x2="8" y2="14.01" />
                        <line x1="12" y1="14" x2="12" y2="14.01" />
                        <line x1="16" y1="14" x2="16" y2="14.01" />
                        <line x1="8" y1="18" x2="8" y2="18.01" />
                        <line x1="12" y1="18" x2="12" y2="18.01" />
                        <line x1="16" y1="18" x2="16" y2="18.01" />
                      </svg>
                    </button>
                  </div>
                </fieldset>

                {/* クイック金額ボタン */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">クイック入力</legend>
                  <div className="grid grid-cols-4 gap-2">
                    {QUICK_AMOUNTS.map(value => (
                      <button
                        key={value}
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => setAmount(prev => prev + value)}
                      >
                        +{value}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline btn-error"
                      onClick={() => setAmount(0)}
                    >
                      C
                    </button>
                  </div>
                </fieldset>

                {selectedReceivers.length > 1 && (
                  <div className="text-sm opacity-60">
                    合計: ${(amount * selectedReceivers.length).toLocaleString()}
                    （{selectedReceivers.length}人 × ${amount.toLocaleString()}）
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-block btn-primary"
                  onClick={handleTransfer}
                  disabled={isSending || selectedReceivers.length === 0 || amount <= 0}
                >
                  {isSending ? "送金中..." : `$${amount.toLocaleString()} を送金する`}
                </button>
              </div>
              {/* プレイヤーリスト */}
              <ul className="list bg-base-100 rounded-box shadow-md">
                <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                  プレイヤー一覧
                </li>
                {players.map(player => (
                  <li key={player.id} className="list-row items-center">
                    <div className="size-10 rounded-full shadow-sm" style={{ backgroundColor: player.color }} />
                    <div className="list-col-grow">
                      <div className="font-bold">
                        {player.name}
                        {player.id === myPlayerId && " (自分)"}
                      </div>
                      <div className="text-xs opacity-60">
                        {player.is_host ? "👑 ホスト" : "プレイヤー"}
                      </div>
                    </div>
                    <div className="font-mono font-bold">
                      ${player.money.toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>

              {/* ゲーム終了ボタン（ホストのみ） */}
              {isHost && (
                <button
                  type="button"
                  className="btn btn-block btn-error btn-outline"
                  onClick={handleFinishGame}
                >
                  ゲームを終了する
                </button>
              )}
            </div>
          ) : (
            /* 取引履歴タブ */
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="p-10 bg-base-100 rounded-box shadow text-center opacity-50">
                  取引履歴がありません
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="bg-base-100 rounded-box shadow-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm">
                          {log.sender ? (
                            <span className="flex items-center gap-1">
                              <span className="inline-block size-3 rounded-full" style={{ backgroundColor: log.sender.color }} />
                              {log.sender.name}
                            </span>
                          ) : (
                            <span>銀行</span>
                          )}
                          <span className="opacity-60 font-normal mx-1">→</span>
                          {log.receivers.map((r, i) => (
                            <span key={r.player.id} className="inline-flex items-center gap-1">
                              {i > 0 && ", "}
                              <span className="inline-block size-3 rounded-full" style={{ backgroundColor: r.player.color }} />
                              {r.player.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-primary">
                        ${log.amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs opacity-40 mt-1">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 電卓モーダル */}
      <Calculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onConfirm={(value) => setAmount(value)}
      />

      {/* 利息モーダル */}
      <InterestModal
        isOpen={isInterestOpen}
        onClose={() => setIsInterestOpen(false)}
        players={players}
        isSending={isSending}
        onConfirm={async (receivers) => {
          setIsSending(true);
          try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}games/${joinToken}/logs`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
              },
              body: JSON.stringify({
                sender_player_id: null,
                receivers,
              }),
            });
            if (!res.ok) {
              const errorData = await res.json().catch(() => null);
              throw new Error(errorData?.error || "利息の支払いに失敗しました");
            }
            setIsInterestOpen(false);
            showToast("利息を支払いました", "success");
          } catch (e) {
            showToast(e instanceof Error ? e.message : "利息の支払いに失敗しました", "error");
          } finally {
            setIsSending(false);
          }
        }}
      />
    </div>
  );
};

export default PlayScreen;
