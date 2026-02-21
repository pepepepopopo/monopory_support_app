import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { Consumer } from "@rails/actioncable";
import { getGameConsumer } from "../utils/actionCable";
import { getToken } from "../utils/auth";
import { useToast } from "./useToast";
import type { GameEvent, Player, TransactionLog } from "../types/game";
import fetchPlayers from "../services/api/players/fetchPlayers";
import fetchLogs from "../services/api/logs/fetchLogs";

interface UseGameChannelOptions {
  /** true: PlayScreen用（送金履歴・MONEY_TRANSFERRED・GAME_FINISHED を処理） */
  withLogs?: boolean;
  myPlayerId?: number;
}

interface UseGameChannelReturn {
  players: Player[];
  logs: TransactionLog[];
  isHost: boolean;
}

export function useGameChannel(
  joinToken: string | undefined,
  options: UseGameChannelOptions = {}
): UseGameChannelReturn {
  const { withLogs = false, myPlayerId } = options;
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [isHost, setIsHost] = useState(false);
  const consumerRef = useRef<Consumer | null>(null);
  const { showToast } = useToast();
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  useEffect(() => {
    if (!joinToken) return;

    const token = getToken();
    if (!token) {
      navigate("/games", { replace: true });
      return;
    }

    // JWTからホスト判定
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(decodeURIComponent(
        atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      ));
      setIsHost(payload.is_host ?? false);
    } catch {
      // ignore
    }

    fetchPlayers(joinToken).then(setPlayers).catch(() => {});
    if (withLogs) {
      fetchLogs(joinToken).then(setLogs).catch(() => {});
    }

    const consumer = getGameConsumer(token);
    consumerRef.current = consumer;

    const subscription = consumer.subscriptions.create(
      { channel: "GameChannel", game_id: joinToken },
      {
        connected() {},
        disconnected() {},
        rejected() {},
        received(data: GameEvent) {
          if (data.type === "PLAYER_ADDED" || data.type === "PLAYER_REMOVED") {
            setPlayers(data.all_players);
          }
          if (data.type === "GAME_DELETED") {
            showToastRef.current(data.message || "ゲームが終了しました", "info");
            navigate("/games");
          }
          if (data.type === "GAME_STARTED") {
            navigate(`/games/${joinToken}/play`, { replace: true });
          }
          if (withLogs) {
            if (data.type === "MONEY_TRANSFERRED") {
              setPlayers(data.all_players);
              if (data.log) {
                setLogs(prev => [data.log!, ...prev]);
                const log = data.log;
                const myId = myPlayerId ?? Number(sessionStorage.getItem("playerId"));
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

  return { players, logs, isHost };
}
