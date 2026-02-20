# マネサク プロジェクト仕様書

## プロジェクト概要

**正式名称**: Money Saku-Saku Support
**略称**: マネサク
**キャッチコピー**: 両替、計算、もう終わり！ノンストレスな銀行役を。
**目的**: オフラインのボードゲーム（モノポリー、人生ゲーム等）をスマホで補助的にプレイするアプリ
**核となる体験**: 面倒な紙幣のやり取りをスマホで完結させ、全員が常に正確な残高を確認できる

### 技術スタック

| 区分 | 使用技術 | 役割 |
|------|----------|------|
| **フロントエンド** | Vite + React + TypeScript + TailwindCSS + DaisyUI | UI・操作画面 |
| **モバイルアプリ** | Capacitor (WebViewラッパー) | iOS ネイティブアプリ（Live Update方式） |
| **バックエンド** | Ruby on Rails 8.0.2 (API mode) | API・状態管理 |
| **リアルタイム通信** | Rails ActionCable (`async` アダプタ) | 双方向通信（WebSocket） |
| **データベース** | PostgreSQL | ゲーム・プレイヤー・履歴の永続化 |
| **環境** | Docker (開発: `compose.yaml`) / Render (本番) | 開発環境の統一・本番デプロイ |

### デプロイ構成

| サービス | プラットフォーム | URL |
|----------|-----------------|-----|
| **バックエンド** | Render (Web Service) | `https://monoporibadei.onrender.com` |
| **フロントエンド** | Render (Static Site) | `https://monopory-buddy-front.onrender.com` |
| **データベース** | Render PostgreSQL | `DATABASE_URL` 環境変数で接続 |
| **独自ドメイン** | - | `https://manesaku.com` |

**重要**: Pumaは `WEB_CONCURRENCY=0`（シングルプロセス）で動作。`async` アダプタはインメモリのため、マルチワーカーではブロードキャストが届かない。

---

## プロジェクト構造

```
monopory_support_app/
├── front/                          # フロントエンド (Vite + React)
│   ├── .env / .env.production      # 環境変数
│   ├── index.html                  # SEO対応（OGP, Twitter Card, GA4, Schema.org）
│   ├── capacitor.config.ts         # Capacitor設定（Live Update + dev/prod切り替え）
│   ├── ios/                        # Capacitor iOS プロジェクト（Xcode scheme: "App"）
│   ├── public/
│   │   ├── _redirects              # Render SPA対応（/* → /index.html）
│   │   ├── robots.txt / sitemap.xml
│   │   └── manesaku_favicon1.png   # ファビコン
│   └── src/
│       ├── components/
│       │   ├── Calculator/         # 電卓コンポーネント（Calculator.tsx, useCalculator.ts）
│       │   ├── button/CopyToClipboard.tsx
│       │   └── Modal/              # JoinGameModal.tsx, QrCodeModal.tsx
│       ├── pages/
│       │   ├── Home.tsx            # LP（Hero + 使い方 + CTA + フッター）
│       │   ├── HomeLayout.tsx      # ルートレイアウト（lemonadeテーマ, max-w-md）
│       │   ├── NotFound.tsx / PrivacyPolicy.tsx / Terms.tsx
│       │   └── games/
│       │       ├── setting/        # NewGame / GameJoin / StartSettingGame
│       │       └── started/        # PlayScreen / ResultScreen
│       ├── hooks/
│       │   ├── usePlayerCleanup.ts
│       │   └── useToast.tsx          # トースト通知（Context + Provider + Hook）
│       ├── services/
│       │   ├── pushNotifications.ts # プッシュ通知（ネイティブアプリ専用）
│       │   └── api/                # createGame / JoinGame / createPlayer
│       ├── types/game.ts           # Player, GameEvent, TransactionLog型定義
│       └── utils/
│           ├── actionCable.ts      # ActionCable接続（トークン付きファクトリ関数）
│           └── auth.ts             # JWT認証ヘルパー
│
└── back/                           # バックエンド (Rails)
    ├── Dockerfile
    ├── config/
    │   ├── cable.yml               # ActionCable設定（async アダプタ）
    │   ├── routes.rb
    │   ├── initializers/           # cors.rb, rack_attack.rb
    │   └── environments/production.rb
    ├── lib/json_web_token.rb       # JWT encode/decode
    └── app/
        ├── models/                 # game.rb, player.rb, log.rb, log_receiver.rb
        ├── controllers/
        │   ├── application_controller.rb  # authenticate_player!, current_player
        │   └── api/                # games / players / logs コントローラー
        └── channels/
            ├── application_cable/connection.rb  # JWT検証
            └── game_channel.rb     # リアルタイム通信
```

---

## データモデル

### Game
| カラム | 型 | 説明 |
|--------|-----|------|
| `join_token` | string | 8文字のユニークな参加コード（base58, `before_validation` で生成） |
| `start_money` | integer | 初期所持金（デフォルト: 15000） |
| `status` | enum | `waiting: 0`, `playing: 1`, `finished: 2` |

**関連**: `has_many :players, :logs (dependent: :destroy)`
**注意**: `generate_join_token` は `return if join_token.present?` で更新時のトークン変更を防止。

### Player
| カラム | 型 | 説明 |
|--------|-----|------|
| `game_id` | integer | 外部キー |
| `name` | string | 1〜20文字（ひらがな/カタカナ/漢字/英数字/スペース） |
| `color` | string | 16進数カラーコード |
| `is_host` | boolean | ホスト権限（`game.players.empty?` で自動判定） |
| `money` | integer | 現在の所持金（0以上） |

### Log / LogReceiver
- `Log`: 送金履歴（`sender_player_id` NULL = 銀行）、`has_many :log_receivers`
- `LogReceiver`: 送金先（`player_id`, `amount`）

---

## API エンドポイント

### Games
| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| POST | `/api/games` | 不要 | ゲーム作成 |
| GET | `/api/games/:join_token` | 不要 | ゲーム詳細取得 |
| DELETE | `/api/games/:join_token` | JWT（ホスト） | ゲーム削除 |
| POST | `/api/games/:join_token/start` | JWT（ホスト） | ゲーム開始 |
| POST | `/api/games/:join_token/finish` | JWT（ホスト） | ゲーム終了 |

`GET /api/games` は join_token 漏洩防止のため削除済み。

### Players
| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| GET | `/api/games/:join_token/players` | 不要 | プレイヤーリスト |
| POST | `/api/players` | 不要 | プレイヤー作成 + JWT発行 → `{ player, token }` |
| PUT | `/api/players/:id` | JWT | プレイヤー更新 |
| DELETE | `/api/players/:id` | JWT（本人 or ホスト） | プレイヤー削除 |

### Logs
| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| GET | `/api/games/:game_join_token/logs` | JWT | 送金履歴取得 |
| POST | `/api/games/:game_join_token/logs` | JWT | 送金実行 |

---

## 認証・認可システム（JWT）

**認証フロー**:
```
ゲーム作成（認証不要） → POST /api/games
プレイヤー作成 = "ログイン"（認証不要） → POST /api/players → JWT発行
以降の全リクエスト → Authorization: Bearer <JWT>
WebSocket → wss://example.com/cable?token=<JWT>
```

- **JWTペイロード**: `{ player_id, game_id, is_host, exp(24h) }`
- **シークレット**: `Rails.application.secret_key_base`
- **状態管理**: `sessionStorage` にJWT・playerId・isHost保存（タブ単位分離）

**認可チェック**:
- ホスト操作（start/finish/destroy）: `current_player.is_host && current_player.game_id == game.id`
- プレイヤー送金: `sender_player_id == current_player.id`
- 銀行送金: `current_player.is_host` のみ
- プレイヤー削除: 本人 or ホスト

---

## ActionCableイベント

| イベント名 | 発火タイミング | ペイロード |
|-----------|--------------|-----------|
| `PLAYER_ADDED` | プレイヤー参加時 | `{ type, all_players }` |
| `PLAYER_REMOVED` | 一般プレイヤー退出時 | `{ type, all_players }` |
| `GAME_DELETED` | ホスト退出時 | `{ type, message }` |
| `GAME_STARTED` | ゲーム開始時 | `{ type, game, players }` |
| `MONEY_TRANSFERRED` | 送金実行時 | `{ type, all_players, log }` |
| `GAME_FINISHED` | ゲーム終了時 | `{ type, all_players }` |

---

## 実装済み機能サマリー

### フェーズ1: ロビー（完了）
- ゲーム作成・参加（QRコード・参加コード）
- プレイヤーリスト同期（ActionCable）
- ゲーム開始（ホスト権限、所持金初期化）
- 退出処理（`usePlayerCleanup`, `isLeavingRef`）

### フェーズ2: 送金管理（完了）
- 1対多送金、銀行モード（ホスト専用）
- サーバー側バリデーション（負の金額、残高不足、`SELECT FOR UPDATE`）
- ゲーム終了 → ResultScreen（順位表示）

### Phase 3: Webリリース準備（完了）
- SEO（OGP, Twitter Card, Schema.org, GA4, Search Console）
- SPA対応（`_redirects`）、404ページ、プライバシーポリシー・利用規約
- 独自ドメイン `manesaku.com`、LP、Favicon
- レート制限（`rack-attack`）
- SEOキーワード対策（下記参照）

#### SEOターゲットキーワード
| キーワード | 対応箇所 |
|-----------|---------|
| 「モノポリー 銀行役 面倒」 | title, description, OG, FAQ構造化データ, LP悩みセクション |
| 「人生ゲーム お金 足りない 対策」 | description, FAQ構造化データ, LP悩みセクション, LP特徴セクション |
| 「ボードゲーム 現金管理 効率化」 | title, description, keywords, FAQ構造化データ, LP悩みセクション |
| 「子供 お金教育 ボードゲーム アプリ」 | description, OG, Twitter Card, FAQ構造化データ, LP特徴セクション |

**SEO実装内容**:
- `index.html`: title・description・OG・Twitter Card にキーワード自然配置、FAQPage構造化データ追加（4問）
- `Home.tsx`: 「こんなお悩みありませんか？」セクション + 「マネサクの特徴」セクション追加

### Phase 4: セキュリティ強化（完了）
- JWT認証、Mass Assignment修正、WebSocket認証
- 送金なりすまし防止、IDOR防止、Race Condition対策

### Phase 7: iOS アプリ（進行中）
- Capacitor セットアップ完了、iOS シミュレータ動作確認済み
- Live Update方式（`https://manesaku.com` をWebViewで表示）
- プッシュ通知コード実装済み（`@capacitor/push-notifications`）
- 詳細は下記「iOS アプリ（Capacitor）」セクション参照

### Phase 7.5: トースト通知（完了）
- React Context + DaisyUI `toast` + `alert` でグローバル通知システム
- `useToast()` Hook: `showToast(message, type?, duration?)` — type: `success` | `error` | `info`
- 送金/受金時リアルタイム通知（ActionCable `MONEY_TRANSFERRED` イベント連動）
- 全 `alert()` 呼び出しを `showToast()` に置き換え済み（PlayScreen, StartSettingGame, NewGame, GameJoin）

---

## iOS アプリ（Capacitor）

### capacitor.config.ts
```typescript
const isDev = process.env.CAP_DEV === "true";
const config: CapacitorConfig = {
  appId: "com.manesaku.app",
  appName: "マネサク",
  webDir: "dist",
  server: isDev
    ? { url: "http://localhost:5173", cleartext: true }   // 開発
    : { url: "https://manesaku.com", cleartext: false },  // 本番: Live Update
  ios: { contentInset: "automatic" },
  plugins: {
    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] },
  },
};
```

### プッシュ通知（pushNotifications.ts）
- `Capacitor.isNativePlatform()` でWeb版では何もしない
- `requestPushPermission()` → `initializePushNotifications()` → リスナー登録
- `main.tsx` でアプリ起動時に初期化

### 開発ワークフロー
```bash
# 開発モード
CAP_DEV=true npx cap sync ios && npx cap open ios

# 本番モード
npx cap sync ios && npx cap open ios
```

**注意事項**:
- Xcode scheme名は `App`（`ios.scheme` を指定しないこと）
- `simctl not found` → `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`
- ランタイムなし → Xcode Settings → Platforms からインストール
- `npx cap run ios` 失敗時 → `npx cap open ios` でXcodeから直接実行

### 未実装
- Apple Developer Program登録（$99/年）→ App Store審査提出
- FCMサーバーサイドプッシュ通知送信
- AdMob広告、RevenueCat課金、Android対応

---

## 本番環境設定

### 環境変数

**バックエンド（Render Web Service）**:
| 変数名 | 値 |
|--------|-----|
| `WEB_CONCURRENCY` | `0`（シングルプロセス必須） |
| `RAILS_MASTER_KEY` | (秘密) |

**フロントエンド（Render Static Site）**:
| 変数名 | 値 |
|--------|-----|
| `VITE_API_BASE_URL` | `https://monoporibadei.onrender.com/api/`（末尾`/`必須） |
| `VITE_WS_URL` | `wss://monoporibadei.onrender.com/cable` |

### 主要設定
- **CORS**: `cors.rb` でフロントエンドURL + `manesaku.com` を許可
- **ActionCable origin**: `production.rb` で設定
- **cable.yml**: `async` アダプタ（Redis不要、シングルプロセス前提）
- **SSL**: `force_ssl = true` + `assume_ssl = true`
- **GA4**: `G-JHPZGG198B`

---

## セキュリティ（未対応項目）

| 優先度 | 項目 | 備考 |
|--------|------|------|
| HIGH | CSRF保護なし | Rails APIモードで `protect_from_forgery` 無効 |
| MEDIUM | リクエストサイズ制限なし | `receivers` 配列に大量データ送信可能 |
| MEDIUM | ページネーションなし | `Game.all` で全件返却 |
| MEDIUM | `database.yml` にパスワード平文 | 開発用だが `password: password` |

---

## 機能追加計画

### 優先度: 高
- ~~**トースト通知**~~: ✅ 実装済み（Phase 7.5）
- **ルーレット**: プレイヤー順決め、カスタム項目、アニメーション
- **プレイヤーキック**: ホストのみ、ロビーでの除外機能
- **ブラウザバック防止**: `beforeunload` イベント

### 優先度: 中
- **利息配布機能**: ホストがゲーム中に利率を設定し、全プレイヤーの残高に対して一律で銀行から利息を一括支払い。端数は切り上げ。モーダルで利率設定→「支払い」ボタンで実行。展開ボタンはPlayScreenの送金フォーム横。ホストのみ操作可能
- **送金取り消し（Undo）**: ホストのみ、直近1件
- **ゲームテンプレート**: モノポリー¥15,000 / 人生ゲーム¥10,000 / カスタム
- **結果シェア**: Web Share API / html2canvas
- **送金メモ**: `logs` に `note` カラム追加
- **残高警告**: 初期資金10%以下で赤色、0で破産バッジ

### 優先度: 低
- メモ機能、リアクション（スタンプ）、効果音、ゲーム統計

---

## ロードマップ

### Phase 5: 収益化（広告 + 課金）📋 準備中

#### プラン設計

| プラットフォーム | プラン | 内容 |
|-----------------|--------|------|
| **Web（ブラウザ）** | 無料のみ | 広告表示あり、課金機能なし |
| **iOS アプリ** | 無料（広告あり） | AdMob 広告表示 |
| **iOS アプリ** | 1日広告なし ¥100 | Consumable（サーバー側で期限管理） |
| **iOS アプリ** | 1ヶ月広告なし ¥500 | Auto-Renewable Subscription |

#### 実装順序
1. AdMob 広告実装（iOS）/ AdSense（Web）⏳
2. Apple Developer Program 登録（$99/年）⏳
3. App Store Connect で商品登録（Consumable + Subscription）⏳
4. RevenueCat 導入（iOS 課金処理）⏳
5. Rails に購入状態管理 API 追加（レシート検証 + DB保存）⏳
6. フロント: `Capacitor.isNativePlatform()` で課金UIの出し分け ⏳

#### 技術構成
```
iOS アプリ → RevenueCat SDK で購入処理
  → レシートを Rails API に送信
  → Apple Server API でレシート検証 → 購入状態をDBに保存
フロント → API で購入状態確認 → 広告の表示/非表示切り替え
Web版 → 課金UI非表示（広告のみ）
```

#### 必要な追加実装
| 区分 | 内容 |
|------|------|
| **iOS (Capacitor)** | RevenueCat SDK（購入UI・処理） |
| **Rails API** | 購入テーブル + レシート検証エンドポイント + Apple Server Notifications v2 webhook |
| **フロント** | 購入状態チェック → 広告表示の出し分け、ネイティブ判定で課金UI表示 |

- プライバシーポリシー・利用規約ページ ✅
- 目標: 月¥1,000〜3,000

### Phase 6: インフラ強化（Redis導入）⏳
- `async` → `redis` アダプタ移行（マルチワーカー対応）
- Upstash or Render Redis（$7〜10/月）

### Phase 7: スマホアプリ（Capacitor）🔧 進行中
- Capacitor + iOS基盤 ✅
- プッシュ通知コード ✅
- Apple Developer登録 → App Store提出 ⏳
- AdMob広告 / RevenueCat課金 / Android対応 ⏳
- 費用: Apple $99/年 + Google $25

### Phase 7.5: 機能拡張 🔧 進行中
- トースト通知 ✅
- ルーレット等（Web更新で即時反映）⏳

---

## 開発Tips

```bash
# バックエンド起動（Docker）
cd back && docker-compose up

# フロントエンド起動
cd front && npm run dev

# iOS シミュレータ（開発）
cd front && CAP_DEV=true npx cap sync ios && npx cap open ios

# Railsコンソール / マイグレーション
docker-compose exec web rails c
docker-compose exec web rails db:migrate
```

### デバッグポイント
- **ActionCable接続不可**: `actionCable.ts` のURL確認 + `production.rb` の `allowed_request_origins`
- **ブロードキャスト不達**: `WEB_CONCURRENCY=0` か確認
- **本番APIエラー**: `VITE_API_BASE_URL` 末尾 `/` を確認
- **join_token変更**: `game.rb` に `return if join_token.present?` があるか確認
- **Docker rollupエラー**: `compose.yaml` の `node_modules` は匿名ボリューム（`/app/node_modules`）にすること。ホストのmacOS用モジュールをマウントするとLinuxコンテナで動かない

### 仕様変更トリガー
| トリガー | 変更対象 |
|----------|----------|
| スマホアプリCORS | `cors.rb` に新origin追加 |
| マルチプロセス化 | `cable.yml` → redis + `Gemfile` に `gem 'redis'` |

---

**最終更新**: 2026-02-10
