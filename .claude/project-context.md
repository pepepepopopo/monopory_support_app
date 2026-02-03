# DigiPoly プロジェクト仕様書

## プロジェクト概要

**アプリ名**: DigiPoly
**目的**: オフラインのモノポリーをスマホで補助的にプレイするアプリ
**核となる体験**: 面倒な紙幣のやり取りをスマホで完結させ、全員が常に正確な残高を確認できる

### 技術スタック

| 区分 | 使用技術 | 役割 |
|------|----------|------|
| **フロントエンド** | Vite + React + TypeScript + TailwindCSS + DaisyUI | UI・操作画面 |
| **バックエンド** | Ruby on Rails 8.0.2 (API mode) | API・状態管理 |
| **リアルタイム通信** | Rails ActionCable (`async` アダプタ) | 双方向通信（WebSocket） |
| **データベース** | PostgreSQL | ゲーム・プレイヤー・履歴の永続化 |
| **環境** | Docker (開発) / Render (本番) | 開発環境の統一・本番デプロイ |

### デプロイ構成

| サービス | プラットフォーム | URL |
|----------|-----------------|-----|
| **バックエンド** | Render (Web Service) | `https://monoporibadei.onrender.com` |
| **フロントエンド** | Render (Static Site) | `https://monopory-buddy-front.onrender.com` |
| **データベース** | Render PostgreSQL | `DATABASE_URL` 環境変数で接続 |

**重要**: Pumaは `WEB_CONCURRENCY=0`（シングルプロセス）で動作。`async` アダプタはインメモリのため、マルチワーカーではブロードキャストが届かない。

---

## プロジェクト構造

```
monopory_support_app/
├── front/                          # フロントエンド (Vite + React)
│   ├── .env                        # 開発環境変数
│   ├── .env.production             # 本番環境変数
│   └── src/
│       ├── components/             # 再利用可能なコンポーネント
│       │   ├── button/
│       │   │   └── CopyToClipboard.tsx
│       │   └── Modal/
│       │       ├── JoinGameModal.tsx
│       │       └── QrCodeModal.tsx
│       ├── pages/
│       │   └── games/
│       │       ├── setting/        # 初期設定画面
│       │       │   ├── NewGame.tsx          # ゲーム作成
│       │       │   ├── GameJoin.tsx         # ゲーム参加
│       │       │   └── StartSettingGame.tsx # プレイヤーリスト + 開始
│       │       └── started/        # ゲーム実行画面
│       │           ├── PlayScreen.tsx       # 送金管理
│       │           └── ResultScreen.tsx     # ゲーム結果（順位表示）
│       ├── hooks/
│       │   └── usePlayerCleanup.ts # 退出処理ロジック
│       ├── services/               # API通信
│       │   └── api/
│       │       ├── games/
│       │       │   ├── createGame.tsx
│       │       │   └── JoinGame.tsx
│       │       └── player/
│       │           └── createPlayer.tsx
│       ├── types/
│       │   └── game.ts             # Player, GameEvent, TransactionLog型定義
│       └── utils/
│           ├── actionCable.ts      # ActionCable接続設定（トークン付きファクトリ関数）
│           └── auth.ts             # JWT認証ヘルパー（getToken, setToken, removeToken, getAuthHeaders, getTokenPayload）
│
└── back/                           # バックエンド (Rails)
    ├── Dockerfile
    ├── config/
    │   ├── cable.yml               # ActionCable設定（async アダプタ）
    │   ├── database.yml
    │   ├── routes.rb
    │   ├── initializers/
    │   │   ├── cors.rb             # CORS設定
    │   │   └── rack_attack.rb      # レート制限設定
    │   └── environments/
    │       └── production.rb       # 本番設定（ActionCable origin等）
    ├── lib/
    │   └── json_web_token.rb       # JWT encode/decode ユーティリティ
    └── app/
        ├── models/
        │   ├── game.rb             # has_many :players, :logs, join_token生成, status enum
        │   ├── player.rb           # belongs_to :game, バリデーション（name, color, money）
        │   ├── log.rb              # 送金履歴（1対多送金対応）
        │   └── log_receiver.rb     # 送金先
        ├── controllers/
        │   ├── application_controller.rb # authenticate_player!, current_player（JWT認証）
        │   └── api/
        │       ├── games_controller.rb # ゲーム作成・参照 + start/finish/destroy（JWT認証）
        │       ├── players_controller.rb # プレイヤー作成（JWT発行）+ 削除（JWT認証）
        │       └── logs_controller.rb  # 送金履歴の取得・作成（JWT認証 + sender検証 + SELECT FOR UPDATE）
        └── channels/
            ├── application_cable/
            │   └── connection.rb   # JWT検証（query param `token`）
            └── game_channel.rb     # リアルタイム通信（game_id検証付き）
```

---

## データモデル

### Game (ゲーム)

| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | integer | 主キー |
| `join_token` | string | 8文字のユニークな参加コード（base58） |
| `start_money` | integer | 初期所持金（デフォルト: 15000） |
| `status` | enum | `waiting: 0`, `playing: 1`, `finished: 2` |

**関連**: `has_many :players, dependent: :destroy` / `has_many :logs, dependent: :destroy`

**注意**: `generate_join_token` は `before_validation` コールバックで実行。`join_token.present?` の場合はスキップする（更新時にトークンが変わるバグを防止）。

### Player (プレイヤー)

| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | integer | 主キー |
| `game_id` | integer | 外部キー |
| `name` | string | プレイヤー名 |
| `color` | string | 識別用カラーコード（例: `#FF5733`） |
| `is_host` | boolean | ホスト権限フラグ |
| `money` | integer | 現在の所持金 |

**関連**: `belongs_to :game`

### Log (送金履歴)

| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | integer | 主キー |
| `game_id` | integer | 外部キー |
| `sender_player_id` | integer (nullable) | 送金元プレイヤー（NULL = 銀行） |
| `amount` | integer | 送金合計額 |

**関連**: `belongs_to :game` / `belongs_to :sender_player, optional: true` / `has_many :log_receivers`

### LogReceiver (送金先)

| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | integer | 主キー |
| `log_id` | integer | 外部キー |
| `player_id` | integer | 受取プレイヤー |
| `amount` | integer | 受取金額 |

**関連**: `belongs_to :log` / `belongs_to :player`

---

## フェーズ別実装状況

### フェーズ1: 初期設定フェーズ（ロビー）- 完了

#### 実装済み機能

**A. ゲーム作成（ホスト）**
- `POST /api/games` でゲーム作成
- `join_token` を取得
- ホスト自身を `POST /api/players` で登録（`is_host` はサーバー側で `game.players.empty?` により自動判定）
- レスポンスの `token`（JWT）を `sessionStorage` に保存
- `sessionStorage` に `playerId` と `isHost` を保存（UI表示用、権限チェックはJWTで実施）
- StartSettingGame へ遷移

**B. ゲーム参加（一般プレイヤー）**
- URLパラメータから `join_token` を取得
- `GET /api/games/:join_token` でゲーム存在確認
- ゲームが `playing` 状態の場合は参加不可
- 名前・色を入力後、`POST /api/players` で登録（`is_host` はサーバー側で自動判定）
- レスポンスの `token`（JWT）を `sessionStorage` に保存
- `sessionStorage` に `playerId` と `isHost` を保存（UI表示用）
- StartSettingGame へ遷移

**C. プレイヤーリスト同期**
- `GET /api/games/:join_token/players` で初期データ取得
- ActionCable (`GameChannel`) をJWTトークン付きでサブスクライブ（`getGameConsumer(token)`）
- `connected()` コールバックでプレイヤー一覧を再取得（WebSocket確立前のイベント取りこぼし防止）
- `PLAYER_ADDED` / `PLAYER_REMOVED` / `GAME_DELETED` / `GAME_STARTED` イベント対応
- QRコード・参加コード表示

**D. ゲーム開始**
- `POST /api/games/:join_token/start` でゲームステータスを `playing` に変更
- **JWT認証**: `Authorization: Bearer <token>` ヘッダーで認証、`current_player.is_host` で検証（非ホストは403）
- 全プレイヤーの所持金を `start_money` で初期化
- `GAME_STARTED` イベントをブロードキャスト

**E. 退出処理（クリーンアップ）**
- `usePlayerCleanup` フック：明示的な `cleanupPlayer()` 呼び出しのみ（戻るボタン）
- `DELETE /api/players/:id` にJWT認証ヘッダーを付与（本人またはホストのみ削除可能）
- ホスト退出時: `game.destroy` → `GAME_DELETED` ブロードキャスト
- 一般プレイヤー退出時: `player.destroy` → `PLAYER_REMOVED` ブロードキャスト
- `isLeavingRef` で自身の退出時に `GAME_DELETED` アラートをスキップ
- クリーンアップ完了後に `removeToken()` でJWTを破棄

---

### フェーズ2: 送金管理 + ゲーム終了 - 完了

#### 実装済み機能

**A. PlayScreen（メイン画面）**
- 全プレイヤーの所持金をリアルタイム表示
- 送金フォーム（送金元選択 + 送金先複数選択 + 金額入力）
- クイック金額ボタン（+1, +5, +10, +50, +100, +200, +500, C リセット）
- 取引履歴タブ

**B. 送金ロジック**
- **1対多送金**: 1人の送金元から複数の送金先へ同時送金
- **ホスト専用**: 銀行モード切り替え（`btn-warning` トグルボタン + 銀行アイコン）
- **JWT認証**: 全送金リクエストに `Authorization: Bearer <token>` ヘッダー必須
- **送金元検証**: `sender_player_id == current_player.id` をサーバー側で検証（なりすまし防止）
- **銀行送金検証**: `current_player.is_host` でホストのみ許可
- **サーバー側バリデーション**:
  - 負の金額チェック（`amount <= 0` でリジェクト）
  - 残高不足チェック（銀行以外）
  - `ActiveRecord::Base.transaction` でアトミック処理

**C. ゲーム終了**
- `POST /api/games/:join_token/finish` でゲーム終了
- **JWT認証**: `current_player.is_host` で検証（非ホストは403）
- `GAME_FINISHED` イベントをブロードキャスト → 全員が結果画面に遷移
- ResultScreen: プレイヤー順位（残高降順）、1位を大きく表示、「トップに戻る」で `removeToken()` 実行

---

## 重要な実装ポイント

### 1. JWT認証システム

**認証フロー**:
```
ゲーム作成（認証不要） → POST /api/games → { game: { id, join_token } }
プレイヤー作成 = "ログイン"（認証不要） → POST /api/players → { player: {...}, token: "JWT..." }
以降の全リクエスト（認証必要） → Authorization: Bearer <JWT>
WebSocket接続（認証必要） → wss://example.com/cable?token=<JWT>
```

**JWT ペイロード**: `{ player_id, game_id, is_host, exp }`
**有効期限**: 24時間
**シークレット**: `Rails.application.secret_key_base`

**認証不要エンドポイント**: ゲーム作成、プレイヤー作成、ゲーム参照、プレイヤー一覧

### 2. 状態管理とプレイヤー識別

| 項目 | 実装方法 | 目的 |
|------|----------|------|
| **認証トークン** | `sessionStorage` に JWT 保存（`auth.ts`） | API認証・WebSocket認証 |
| **自分の特定** | `sessionStorage` に `playerId` 保存 | UI表示用（認証はJWTで実施） |
| **ホスト判定** | JWTペイロードの `is_host` から取得 | UI表示制御（権限チェックはサーバー側JWT検証） |
| **銀行の定義** | `sender_player_id` が NULL | ホストのみ操作可（JWT `is_host` で検証） |

**注意**: `localStorage` ではなく `sessionStorage` を使用（タブ単位の分離）。

### 2. ActionCableイベント設計

| イベント名 | 発火タイミング | ペイロード |
|-----------|--------------|-----------|
| `PLAYER_ADDED` | プレイヤー参加時 | `{ type, all_players }` |
| `PLAYER_REMOVED` | 一般プレイヤー退出時 | `{ type, all_players }` |
| `GAME_DELETED` | ホスト退出時 | `{ type, message }` |
| `GAME_STARTED` | ゲーム開始時 | `{ type, game, players }` |
| `MONEY_TRANSFERRED` | 送金実行時 | `{ type, all_players, log }` |
| `GAME_FINISHED` | ゲーム終了時 | `{ type, all_players }` |

### 3. ホスト操作のバックエンド検証

`start` / `finish` / `destroy` アクションでは `authenticate_player!` でJWTから `current_player` を取得し、`current_player.is_host && current_player.game_id == game.id` で検証。非ホストからのリクエストは `403 Forbidden` を返却。

### 3.5. 送金の認可チェック

- **プレイヤー送金**: `sender_player_id == current_player.id` をサーバー側で検証（なりすまし防止）
- **銀行送金**: `current_player.is_host` でホストのみ許可
- **プレイヤー削除**: 本人（`current_player.id == player.id`）またはホスト（`current_player.is_host`）のみ許可

### 4. join_token の安定性

- `generate_join_token` は `before_validation` で実行
- `return if join_token.present?` により、`game.update` 時にトークンが変わらないことを保証

---

## API エンドポイント一覧

### Games

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| POST | `/api/games` | 不要 | ゲーム作成 |
| GET | `/api/games/:join_token` | 不要 | ゲーム詳細取得 |
| DELETE | `/api/games/:join_token` | JWT（ホスト） | ゲーム削除 |
| POST | `/api/games/:join_token/start` | JWT（ホスト） | ゲーム開始 |
| POST | `/api/games/:join_token/finish` | JWT（ホスト） | ゲーム終了 |

**削除済み**: `GET /api/games`（join_token漏洩防止のため）

### Players

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| GET | `/api/games/:join_token/players` | 不要 | ゲーム内プレイヤーリスト |
| POST | `/api/players` | 不要 | プレイヤー作成 + JWT発行 |
| PUT | `/api/players/:id` | JWT | プレイヤー更新 |
| DELETE | `/api/players/:id` | JWT（本人 or ホスト） | プレイヤー削除 |

**レスポンス変更**: `POST /api/players` は `{ player: {...}, token: "JWT..." }` を返却

### Logs (送金)

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| GET | `/api/games/:game_join_token/logs` | JWT | 送金履歴取得 |
| POST | `/api/games/:game_join_token/logs` | JWT | 送金実行（sender検証 + バリデーション） |

---

## TypeScript型定義

```typescript
// front/src/types/game.ts

export interface Player {
  id: number;
  name: string;
  color: string;
  is_host: boolean;
  money: number;
}

export interface LogReceiver {
  player: Pick<Player, "id" | "name" | "color">;
  amount: number;
}

export interface TransactionLog {
  id: number;
  amount: number;
  sender: Pick<Player, "id" | "name" | "color"> | null;
  receivers: LogReceiver[];
  created_at: string;
}

export interface GameEvent {
  type: "PLAYER_ADDED" | "PLAYER_REMOVED" | "GAME_DELETED" | "GAME_STARTED" | "MONEY_TRANSFERRED" | "GAME_FINISHED";
  player?: Player;
  all_players: Player[];
  message?: string;
  log?: TransactionLog;
}
```

---

## 本番デプロイ設定

### Render構成

- **バックエンド**: Web Service（Docker）
- **フロントエンド**: Static Site（`npm run build`）
- **DB**: Render PostgreSQL

### 環境変数

#### バックエンド (Render Web Service)
| 変数名 | 値 | 説明 |
|--------|-----|------|
| `DATABASE_URL` | (自動) | PostgreSQL接続URL |
| `WEB_CONCURRENCY` | `0` | シングルプロセス（asyncアダプタのため必須） |
| `RAILS_LOG_LEVEL` | `info` | ログレベル |
| `RAILS_MASTER_KEY` | (秘密) | credentials復号キー |

#### フロントエンド (Render Static Site)
| 変数名 | 値 | 説明 |
|--------|-----|------|
| `VITE_API_BASE_URL` | `https://monoporibadei.onrender.com/api/` | API基底URL（末尾`/`必須） |
| `VITE_WS_URL` | `wss://monoporibadei.onrender.com/cable` | WebSocket接続URL |

### 本番環境の主要設定

- **CORS**: `cors.rb` でフロントエンドのRender URLを許可
- **ActionCable origin**: `production.rb` で `allowed_request_origins` を設定
- **cable.yml**: `async` アダプタ（Redis不要、シングルプロセス前提）
- **cache/queue**: `memory_store` / `async`（solid_cache/solid_queue は無効化、別DB不要）
- **SSL**: `force_ssl = true` + `assume_ssl = true`

---

## 将来計画（ロードマップ）

### Phase 3: Webリリース準備

- **独自ドメイン取得・設定**
  - `cors.rb` と `production.rb` の origin に新ドメインを追加
  - SSL証明書（Render自動 or Cloudflare）
- **Redis導入**
  - ActionCable アダプタを `async` → `redis` に移行
  - マルチワーカー対応（`WEB_CONCURRENCY` を1以上に）
  - Render Redis サービス or 外部Redis（Upstash等）
- ~~**レート制限**: `rack-attack` gem 導入（DoS防止・ブルートフォース防止）~~ ✅ 完了
- **エラー監視**: Sentry等の導入

### Phase 4: セキュリティ強化 - ✅ 完了

- ~~**認証システム導入**（JWT）~~ ✅ 完了
  - ~~全APIエンドポイントに認証を要求~~ ✅ 完了
  - ~~`playerId` / `isHost` のクライアント側偽装を防止~~ ✅ 完了
- ~~**送金操作の認証**: リクエスト元プレイヤーの本人確認~~ ✅ 完了
- ~~**ActionCable接続認証**: `ApplicationCable::Connection` で current_user 識別~~ ✅ 完了
- ~~**プレイヤー操作の認可**: `DELETE /api/players/:id` 等で本人確認~~ ✅ 完了

### Phase 5: スマホアプリ対応

- **技術選択**
  - PWA: 既存Webアプリをそのまま活用、ホーム追加で使用（低コスト）
  - React Native: ネイティブ体験、プッシュ通知対応（高品質）
- **API共用**: 既存のREST + WebSocket APIをそのまま利用
- **認証必須**: スマホアプリからのAPI呼び出しにトークン認証（Phase 4が前提）
- **プッシュ通知**: ゲーム開始・送金通知

---

## セキュリティ監査結果（2026-02-02 実施）

### 対応済み

- [x] 送金額のサーバー側バリデーション（負の金額・残高不足チェック） - `logs_controller.rb`
- [x] ホスト操作のバックエンド検証（JWT `current_player.is_host` で確認） - `games_controller.rb`
- [x] CORS設定（本番フロントエンドURL許可） - `cors.rb`
- [x] ActionCable origin 設定 - `production.rb`
- [x] `solid_cable` → `async`（別DB不要構成） - `cable.yml`
- [x] `solid_cache`/`solid_queue` → `memory_store`/`async` - `production.rb`
- [x] **JWT認証システム導入** - `json_web_token.rb`, `application_controller.rb`, 全コントローラー
- [x] **Mass Assignment修正**: `permit` から `:money`, `:is_host` を削除、サーバー側で決定 - `players_controller.rb`
- [x] **`GET /api/games` 削除**: join_token漏洩防止 - `games_controller.rb`, `routes.rb`
- [x] **送金操作のなりすまし防止**: `sender_player_id == current_player.id` 検証 - `logs_controller.rb`
- [x] **銀行送金のホスト検証**: `current_player.is_host` で制限 - `logs_controller.rb`
- [x] **IDOR防止**: `games#destroy`, `players#destroy` にJWT認可チェック追加
- [x] **WebSocket認証**: `connection.rb` でJWT検証、`game_channel.rb` で game_id 検証
- [x] **クライアント側のID偽装防止**: 権限チェックはJWTベースに移行（sessionStorageはUI表示用のみ）

### CRITICAL（認証なしでも即時対応可能）

- [x] **ゲーム開始時の初期資金バリデーション**: 対応不要（ユーザー判断: 上限は決めなくていい）

### HIGH

- [x] **送金の競合状態（Race Condition）対策**: `SELECT FOR UPDATE` でロック取得後に残高チェック・更新を実行 - `logs_controller.rb`
- [ ] **CSRF保護なし**: Rails APIモードで `protect_from_forgery` が無効
- [x] **レート制限**: `rack-attack` gem 導入 - `rack_attack.rb`
  - ゲーム作成: 1分間に5回
  - プレイヤー作成: 1分間に10回
  - ゲーム参照（join_token推測防止）: 1分間に30回
  - 送金: 1分間に60回
  - 全般API: 1分間に300リクエスト
- [x] **プレイヤー名のバリデーション**: 1〜20文字、ひらがな/カタカナ/漢字/英数字/スペースのみ - `player.rb`
  - `color`: 16進数カラー形式のみ
  - `money`: 0以上
  - フロントエンド側でもリアルタイムバリデーション実装 - `NewGame.tsx`, `GameJoin.tsx`

### MEDIUM

- [ ] **リクエストサイズ制限なし**: `receivers` 配列に大量データ送信可能 → メモリ枯渇
- [ ] **エラーメッセージの情報漏洩**: `@player.errors` でモデル構造が推測可能
- [ ] **database.yml にパスワードハードコード**: 開発用だが `password: password` が平文
- [ ] **ページネーションなし**: `Game.all` で全件返却 → メモリ枯渇

### 対応優先順位

| 優先度 | 項目 | 対応コスト | 状態 |
|--------|------|-----------|------|
| **即時** | Mass Assignment（`permit` から `:money` 削除） | 1行変更 | ✅ 完了 |
| **即時** | `GET /api/games` の制限 or 削除 | 数行変更 | ✅ 完了 |
| **即時** | `start_money` のバリデーション（上限設定） | 数行変更 | 対応不要（ユーザー判断） |
| **即時** | 送金の楽観ロック（`SELECT FOR UPDATE`） | 数行変更 | ✅ 完了 |
| **高** | レート制限（`rack-attack` gem） | gem追加+設定 | ✅ 完了 |
| **高** | プレイヤー名バリデーション | モデル変更 | ✅ 完了 |
| **大規模** | 認証システム導入（JWT） | 全体的な変更 | ✅ 完了 |
| **大規模** | 送金・削除の認可チェック | 認証導入後 | ✅ 完了 |
| **大規模** | ActionCable接続認証 | 認証導入後 | ✅ 完了 |
| **大規模** | Redis移行（マルチプロセス対応） | インフラ変更 | 未着手 |

---

## 仕様変更が必要な箇所

| トリガー | 変更対象 | 内容 |
|----------|----------|------|
| 独自ドメイン取得 | `cors.rb`, `production.rb` | origin に新ドメインを追加 |
| スマホアプリ対応 | CORS設定 | 新origin追加 or ワイルドカード（認証必須前提） |
| マルチプロセス化 | `cable.yml`, Gemfile | `redis` アダプタに変更 + `redis` gem 追加 |
| 認証導入 | 全controller, `sessionStorage` | `sessionStorage` → JWTベースのプレイヤー識別に移行 |

---

## 開発Tips

### ローカル開発環境

```bash
# バックエンド起動（Docker）
cd back
docker-compose up

# フロントエンド起動
cd front
npm run dev
```

### よく使うコマンド

```bash
# Railsコンソール
docker-compose exec web rails c

# マイグレーション
docker-compose exec web rails db:migrate
```

### デバッグポイント

- **ActionCableが繋がらない**: `actionCable.ts` の接続URL確認、`production.rb` の `allowed_request_origins` 確認
- **ブロードキャストが届かない**: `WEB_CONCURRENCY=0` になっているか確認（マルチワーカーでは `async` アダプタが動かない）
- **プレイヤーリストが更新されない**: `connected()` コールバックで再取得しているか確認
- **本番でAPIエラー**: 環境変数 `VITE_API_BASE_URL` の末尾 `/` を確認
- **join_tokenが変わる**: `game.rb` の `generate_join_token` に `return if join_token.present?` があるか確認

---

**最終更新**: 2026-02-03

**現在のフェーズ**: Phase 4（セキュリティ強化）完了
- フェーズ1: 初期設定（ゲーム作成・参加・同期・退出）✅ 完了
- フェーズ2: 送金管理（1対多送金・銀行機能・履歴表示・ゲーム終了）✅ 完了
- Phase 3: Webリリース準備（計画段階）
- Phase 4: セキュリティ強化 ✅ 完了
  - JWT認証システム導入
  - Mass Assignment修正
  - 送金のなりすまし防止
  - WebSocket認証
  - 競合状態（Race Condition）対策
  - レート制限（rack-attack）
  - プレイヤー名バリデーション
- Phase 5: スマホアプリ対応（構想段階）
