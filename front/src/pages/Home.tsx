import { useEffect } from 'react'
import '../styles/App.css'

function Home() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "lofi");
  },[])

  return (
    <>
      <div className="size-full">
        <div className="min-h-screen bg-base-200 p-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-12 mt-20">
              <h1 className="mb-2 text-primary">🎲 モノポリー資産管理</h1>
              <p className="text-muted-foreground text-primary">銀行役からオサラバ！</p>
            </div>
            <div className="grid gap-4">
              <button className="btn btn-primary w-full h-16">
                <span className="mr-2 text-lg">+</span>
                新しいゲームを作成
              </button>
              <button className="btn btn-outline btn-primary w-full h-16">
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
