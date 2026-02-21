import { apiClient } from "../client";
import type { TransactionLog } from "../../../types/game";

const fetchLogs = (joinToken: string) =>
  apiClient<TransactionLog[]>(`games/${joinToken}/logs`, { auth: true });

export default fetchLogs;
