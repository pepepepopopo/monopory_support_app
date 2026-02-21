import { apiClient } from "../client";
import type { TransactionLog } from "../../../types/game";

interface LogReceiver {
  player_id: number;
  amount: number;
}

const createLog = (
  joinToken: string,
  senderPlayerId: number | null,
  receivers: LogReceiver[]
) =>
  apiClient<{ log: TransactionLog }>(
    `games/${joinToken}/logs`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify({ sender_player_id: senderPlayerId, receivers }),
    }
  );

export default createLog;
