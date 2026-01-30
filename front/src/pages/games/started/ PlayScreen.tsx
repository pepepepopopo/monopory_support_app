import { useState } from "react";

type TabType = 'game' | 'history';

const PlayScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>('game');


  return (
    <div className="min-h-screen bg-base-200 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダーエリア */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">ゲーム中</h2>
        </div>

        {/* タブ切り替え (DaisyUI) */}
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
              {/* ここに TransactionForm, RouletteWheel, PlayerList を配置 */}
              <div className="p-10 bg-base-100 rounded-box shadow text-center">
                ゲームメインコンテンツ（開発中）
              </div>
            </div>
          ) : (
            <div className="p-10 bg-base-100 rounded-box shadow text-center">
              取引履歴（開発中）
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayScreen;