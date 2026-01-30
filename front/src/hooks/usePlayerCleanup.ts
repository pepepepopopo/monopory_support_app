import { useEffect, useRef, useCallback } from "react";

/**
 * プレイヤー退出時のクリーンアップ処理を管理するカスタムフック
 *
 * 用途：
 * - ゲーム設定画面で「戻る」ボタンを押した時
 * - ゲーム参加画面で「戻る」ボタンを押した時
 * - ブラウザを閉じた時
 *
 * これらのタイミングで、参加しているゲームからプレイヤーを削除する
 */
const usePlayerCleanup = () => {
  const hasCleanedUp = useRef(false);

  /**
   * プレイヤー削除APIを呼び出す関数
   */
  const cleanupPlayer = useCallback(async () => {
    // 既にクリーンアップ済みの場合はスキップ
    if (hasCleanedUp.current) return;

    const playerId = sessionStorage.getItem("playerId");
    const isHost = sessionStorage.getItem("isHost");

    console.log("🧹 クリーンアップ実行:", { playerId, isHost });

    if (!playerId) {
      console.warn("⚠️ playerIdがsessionStorageに存在しません");
      return;
    }

    try {
      // プレイヤー削除APIを呼び出す
      console.log(`🗑️ DELETE /api/players/${playerId} を実行中...`);
      const response = await fetch(`http://localhost:3000/api/players/${playerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // クリーンアップ完了フラグを立てる
        hasCleanedUp.current = true;

        // sessionStorageをクリア
        sessionStorage.removeItem("playerId");
        sessionStorage.removeItem("isHost");

        console.log("プレイヤー削除が完了しました");
      }
    } catch (error) {
      console.error("プレイヤー削除に失敗しました", error);
    }
  }, []);

  useEffect(() => {
    // ブラウザを閉じる時のハンドラー
    const handleBeforeUnload = () => {
      const playerId = sessionStorage.getItem("playerId");
      if (playerId && !hasCleanedUp.current) {
        // 同期的に送信するためにnavigator.sendBeaconを使用
        // （fetchは非同期なのでブラウザが閉じる前に完了しない可能性がある）
        const blob = new Blob([JSON.stringify({})], { type: "application/json" });
        navigator.sendBeacon(`http://localhost:3000/api/players/${playerId}`, blob);

        // sessionStorageをクリア
        sessionStorage.removeItem("playerId");
        sessionStorage.removeItem("isHost");
        hasCleanedUp.current = true;
      }
    };

    // イベントリスナーを登録
    window.addEventListener("beforeunload", handleBeforeUnload);

    // クリーンアップ: イベントリスナーを削除
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return { cleanupPlayer };
};

export default usePlayerCleanup;
