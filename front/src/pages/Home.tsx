import { Link } from "react-router";
import JoinGameModal from "../components/Modal/JoinGameModal";

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl font-bold mb-4 text-primary">マネサク 🎲</h1>
        <p className="text-2xl font-semibold mb-2">両替、計算、もう終わり！</p>
        <p className="text-lg opacity-80 mb-8">ノンストレスな銀行役を。</p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link to="/games" className="btn btn-primary w-full h-16">
            ゲームを始める
          </Link>
          <JoinGameModal />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 px-4 bg-base-200 rounded-xl">
        <h2 className="text-2xl font-bold text-center mb-6">使い方</h2>
        <div className="max-w-lg mx-auto space-y-3">
          {/* Step 1 */}
          <div className="card bg-base-100 shadow-sm rounded-xl">
            <div className="card-body flex-row items-center gap-3 p-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-bold">ゲームを作成</h3>
                <p className="text-sm opacity-70">ホストが「ゲームを始める」をタップ</p>
              </div>
              <div className="text-2xl">🎮</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="card bg-base-100 shadow-sm rounded-xl">
            <div className="card-body flex-row items-center gap-3 p-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-bold">参加者を招待</h3>
                <p className="text-sm opacity-70">QRコードまたは参加コードを共有</p>
              </div>
              <div className="text-2xl">📱</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="card bg-base-100 shadow-sm rounded-xl">
            <div className="card-body flex-row items-center gap-3 p-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-bold">ゲーム開始</h3>
                <p className="text-sm opacity-70">全員揃ったらスタート！送金はタップだけ</p>
              </div>
              <div className="text-2xl">🚀</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 bg-primary text-primary-content text-center">
        <h2 className="text-2xl font-bold mb-4">さあ、始めよう</h2>
        <p className="mb-6 opacity-90">アプリのインストール不要。ブラウザですぐに使えます。</p>
        <Link to="/games" className="btn btn-secondary btn-lg">
          無料で始める
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-sm opacity-60">
        <p>Money Saku-Saku Support</p>
        <div className="mt-2 space-x-3">
          <Link to="/privacy" className="link">プライバシーポリシー</Link>
          <Link to="/terms" className="link">利用規約</Link>
        </div>
      </footer>
    </div>
  );
}

export default Home;
