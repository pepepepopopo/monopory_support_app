import type { CapacitorConfig } from "@capacitor/cli";

// 開発モード: CAP_DEV=true npm run cap:sync
const isDev = process.env.CAP_DEV === "true";

const config: CapacitorConfig = {
  appId: "com.manesaku.app",
  appName: "マネサク",
  webDir: "dist",
  server: isDev
    ? {
        // 開発モード: ローカルサーバーを使用
        url: "http://localhost:5173",
        cleartext: true,
      }
    : {
        // 本番モード: Live Update
        url: "https://manesaku.com",
        cleartext: false,
      },
  ios: {
    contentInset: "automatic",
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
