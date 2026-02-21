import type { TransactionLog } from "../../types/game";

interface Props {
  logs: TransactionLog[];
}

const TransactionHistory = ({ logs }: Props) => {
  if (logs.length === 0) {
    return (
      <div className="p-10 bg-base-100 rounded-box shadow text-center opacity-50">
        取引履歴がありません
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map(log => (
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
      ))}
    </div>
  );
};

export default TransactionHistory;
