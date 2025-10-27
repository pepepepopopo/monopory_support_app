import { useEffect } from 'react'
import '../styles/App.css'

function Home() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "lemonade");
  },[])

  return (
    <>
      <div className="size-full">
        <div className="min-h-screen bg-base-100 p-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-12 mt-20">
              <h1 className="mb-2 text-primary-content">🎲 モノポリー資産管理</h1>
              <p className="text-primary-content">銀行役からオサラバ！</p>
            </div>
            <div className="grid gap-4">
              <button className="btn btn-primary w-full h-16">
                <span className="mr-2 text-lg">+</span>
                新しいゲームを作成
              </button>
              <button className="btn btn-secondary w-full h-16">
                ゲームに参加
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
