import { Link } from "react-router";

function NewGame() {
  return(
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="btn mb-6">
          戻る
        </Link>
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border">
          <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
            <div className="leading-none">新しいゲームを作成</div>
            <div className="text-muted-foreground">ゲームの新しいセッションを開始します</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewGame;