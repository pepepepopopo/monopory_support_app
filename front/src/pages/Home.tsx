import { Link } from "react-router";
import '../styles/App.css'

function Home() {
  return (
    <>
      <div className="text-center mb-12 mt-20">
        <h1 className="mb-2 text-primary-content">🎲 モノポリー資産管理</h1>
        <p className="text-primary-content">銀行役からオサラバ！</p>
      </div>
      <div className="grid gap-4">
        <Link to="/games" className="btn btn-primary w-full h-16">
          <span className="mr-2 text-lg">+</span>
          新しいゲームを作成
        </Link>
        <button className="btn btn-secondary w-full h-16">
          ゲームに参加
        </button>
      </div>
    </>
  )
}

export default Home
