import { useRef, useCallback } from "react";
import { getAuthHeaders, removeToken } from "../utils/auth";

/**
 * プレイヤー退出時のクリーンアップ処理を管理するカスタムフック
 *
 * 用途：
 * - ゲーム設定画面で「戻る」ボタンを押した時
 * - ゲーム参加画面で「戻る」ボタンを押した時
 *
 * タブ閉じ時のクリーンアップはサーバー側（ActionCable切断検知）で対応する
 * beforeunloadではリロードとタブ閉じを区別できないため、フロント側では使用しない
 */
const usePlayerCleanup = () => {
  const hasCleanedUp = useRef(false);

  const cleanupPlayer = useCallback(async () => {
    if (hasCleanedUp.current) return;

    const playerId = sessionStorage.getItem("playerId");
    if (!playerId) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}players/${playerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (response.ok) {
        hasCleanedUp.current = true;
        sessionStorage.removeItem("playerId");
        sessionStorage.removeItem("isHost");
        removeToken();
      }
    } catch {
      // ignore
    }
  }, []);

  return { cleanupPlayer };
};

export default usePlayerCleanup;
