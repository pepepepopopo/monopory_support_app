import { Link } from "react-router";
import JoinGameModal from "../components/Modal/JoinGameModal";

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl font-bold mb-4 text-primary">マネサク</h1>
        <p className="text-2xl font-semibold mb-2">両替、計算、もう終わり！</p>
        <p className="text-lg opacity-80 mb-8">ノンストレスな銀行役を。</p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link to="/games" className="btn btn-primary btn-lg">
            ゲームを始める
          </Link>
          <JoinGameModal />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-base-200">
        <h2 className="text-2xl font-bold text-center mb-8">特徴</h2>
        <div className="grid gap-6 max-w-2xl mx-auto">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="card-title text-lg">両替不要</h3>
              <p className="opacity-70">細かいお金の両替作業から解放。タップするだけで送金完了。</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="card-title text-lg">残高が一目瞭然</h3>
              <p className="opacity-70">全員の資産をリアルタイム表示。「いくら持ってる？」の確認が不要に。</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="text-3xl mb-2">🎮</div>
              <h3 className="card-title text-lg">ゲームに集中</h3>
              <p className="opacity-70">計算ミスや数え間違いなし。本来のゲームをもっと楽しめる。</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 px-4">
        <h2 className="text-2xl font-bold text-center mb-8">使い方</h2>
        <div className="max-w-md mx-auto">
          <ul className="steps steps-vertical w-full">
            <li className="step step-primary" data-content="1">
              <div className="text-left ml-4">
                <p className="font-semibold">ゲームを作成</p>
                <p className="text-sm opacity-70">ホストが「ゲームを始める」をタップ</p>
              </div>
            </li>
            <li className="step step-primary" data-content="2">
              <div className="text-left ml-4">
                <p className="font-semibold">参加者を招待</p>
                <p className="text-sm opacity-70">QRコードまたは参加コードを共有</p>
              </div>
            </li>
            <li className="step step-primary" data-content="3">
              <div className="text-left ml-4">
                <p className="font-semibold">ゲーム開始</p>
                <p className="text-sm opacity-70">全員揃ったらスタート！送金はタップだけ</p>
              </div>
            </li>
          </ul>
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
      </footer>
    </div>
  );
}

export default Home;
