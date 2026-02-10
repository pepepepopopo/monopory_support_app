import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

/**
 * プッシュ通知サービス
 * iOS ネイティブアプリでのみ動作し、Web では何もしない
 */

// プッシュ通知の初期化状態
let isInitialized = false;

/**
 * プッシュ通知の権限をリクエスト
 * @returns 権限が付与されたかどうか
 */
export const requestPushPermission = async (): Promise<boolean> => {
  // ネイティブプラットフォームでない場合は何もしない
  if (!Capacitor.isNativePlatform()) {
    console.log("Push notifications are only available on native platforms");
    return false;
  }

  try {
    // 現在の権限状態を確認
    const permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === "granted") {
      return true;
    }

    if (permStatus.receive === "denied") {
      console.log("Push notification permission denied");
      return false;
    }

    // 権限をリクエスト
    const result = await PushNotifications.requestPermissions();
    return result.receive === "granted";
  } catch (error) {
    console.error("Error requesting push permission:", error);
    return false;
  }
};

/**
 * プッシュ通知リスナーを登録
 */
export const initializePushNotifications = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform() || isInitialized) {
    return;
  }

  try {
    // 権限をリクエスト
    const hasPermission = await requestPushPermission();
    if (!hasPermission) {
      return;
    }

    // 通知を登録
    await PushNotifications.register();

    // 登録成功時のリスナー
    PushNotifications.addListener("registration", (token) => {
      console.log("Push registration success, token:", token.value);
      // TODO: 必要に応じてサーバーにトークンを送信
    });

    // 登録エラー時のリスナー
    PushNotifications.addListener("registrationError", (error) => {
      console.error("Push registration error:", error);
    });

    // 通知受信時のリスナー（アプリがフォアグラウンド）
    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        console.log("Push notification received:", notification);
        // TODO: 必要に応じて通知を表示
      }
    );

    // 通知タップ時のリスナー
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action) => {
        console.log("Push notification action performed:", action);
        // TODO: 必要に応じて画面遷移などの処理
      }
    );

    isInitialized = true;
    console.log("Push notifications initialized");
  } catch (error) {
    console.error("Error initializing push notifications:", error);
  }
};

/**
 * プラットフォームがネイティブかどうか
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * 現在のプラットフォーム名を取得
 */
export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};
