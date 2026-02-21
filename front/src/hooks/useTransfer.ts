import { useState } from "react";
import { useToast } from "./useToast";
import type { Player } from "../types/game";
import createLog from "../services/api/logs/createLog";

interface UseTransferReturn {
  fromBank: boolean;
  setFromBank: (v: boolean) => void;
  selectedReceivers: number[];
  toggleReceiver: (id: number) => void;
  amount: number;
  setAmount: (v: number) => void;
  isTransferSending: boolean;
  isInterestSending: boolean;
  handleTransfer: () => Promise<void>;
  handleInterest: (receivers: { player_id: number; amount: number }[]) => Promise<void>;
}

export function useTransfer(
  joinToken: string | undefined,
  players: Player[],
  myPlayerId: number
): UseTransferReturn {
  const [fromBank, setFromBank] = useState(false);
  const [selectedReceivers, setSelectedReceivers] = useState<number[]>([]);
  const [amount, setAmount] = useState(0);
  const [isTransferSending, setIsTransferSending] = useState(false);
  const [isInterestSending, setIsInterestSending] = useState(false);
  const { showToast } = useToast();

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
    if (!joinToken) return;

    const senderPlayerId = fromBank ? null : myPlayerId;
    const myPlayer = players.find(p => p.id === myPlayerId);

    if (!fromBank && myPlayer && myPlayer.money < amount * selectedReceivers.length) {
      showToast("残高が不足しています", "error");
      return;
    }

    setIsTransferSending(true);
    try {
      await createLog(
        joinToken,
        senderPlayerId,
        selectedReceivers.map(id => ({ player_id: id, amount }))
      );
      setSelectedReceivers([]);
      setAmount(0);
      setFromBank(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "送金に失敗しました", "error");
    } finally {
      setIsTransferSending(false);
    }
  };

  const handleInterest = async (receivers: { player_id: number; amount: number }[]) => {
    if (!joinToken) return;
    setIsInterestSending(true);
    try {
      await createLog(joinToken, null, receivers);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "利息の支払いに失敗しました", "error");
      throw e; // モーダル側でcatchしてエラー表示
    } finally {
      setIsInterestSending(false);
    }
  };

  return {
    fromBank,
    setFromBank,
    selectedReceivers,
    toggleReceiver,
    amount,
    setAmount,
    isTransferSending,
    isInterestSending,
    handleTransfer,
    handleInterest,
  };
}
