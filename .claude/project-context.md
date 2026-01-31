# DigiPoly プロジェクト仕様書

## プロジェクト概要

**アプリ名**: DigiPoly
**目的**: オフラインのモノポリーをスマホで補助的にプレイするアプリ
**核となる体験**: 面倒な紙幣のやり取りをスマホで完結させ、全員が常に正確な残高を確認できる

### 技術スタック

| 区分 | 使用技術 | 役割 |
|------|----------|------|
| **フロントエンド** | Vite + React + TypeScript + TailwindCSS + DaisyUI | UI・操作画面 |
| **バックエンド** | Ruby on Rails (API mode) | API・状態管理 |
| **リアルタイム通信** | Rails ActionCable | 双方向通信（WebSocket） |
| **データベース** | PostgreSQL (Neon) | ゲーム・プレイヤー・履歴の永続化 |
| **環境** | Docker + docker-compose | 開発環境の統一 |
| **デプロイ** | Render | 無料枠での運用を想定 |

---

## プロジェクト構造

```
monopory_support_app/
├── front/                          # フロントエンド (Vite + React)
│   └── src/
│       ├── components/             # 再利用可能なコンポーネント
│       │   ├── button/
│       │   │   └── CopyToClipboard.tsx
│       │   └── Modal/
│       │       └── QrCodeModal.tsx
│       ├── pages/
│       │   └── games/
│       │       ├── setting/        # フェーズ1: 初期設定画面
│       │       │   ├── NewGame.tsx          # ゲーム作成
│       │       │   ├── GameJoin.tsx         # ゲーム参加
│       │       │   └── StartSettingGame.tsx # プレイヤーリスト + 開始
│       │       └── started/        # フェーズ2: ゲーム実行画面
│       │           └── PlayScreen.tsx       # 送金管理（実装済み）
│       ├── hooks/                  # カスタムフック
│       │   └── usePlayerCleanup.ts # 退出処理ロジック（実装済み）
│       ├── services/               # API通信
│       │   └── api/games/
│       │       └── createGame.tsx
│       ├── types/
│       │   └── game.ts             # Player, GameEvent, TransactionLog型定義
│       └── utils/
│           └── actionCable.ts      # ActionCable接続設定
│
└── back/                           # バックエンド (Rails)
    └── app/
        ├── models/
        │   ├── game.rb             # has_many :players, :logs, join_token生成, status enum
        │   ├── player.rb           # belongs_to :game
        │   └── log.rb              # 送金履歴（1対多送金対応）
        ├── controllers/api/
        │   ├── games_controller.rb # ゲームCRUD + start アクション
        │   ├── players_controller.rb # プレイヤーCRUD + ゲーム開始後の参加制限
        │   └── logs_controller.rb  # 送金履歴の取得・作成
        └── channels/
            └── game_channel.rb     # リアルタイム通信チャンネル
```

---

## データモデル

### Game (ゲーム)

| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | integer | 主キー |
| `join_token` | string | 8文字のユニークな参加コード（base58） |
| `start_money` | integer | 初期所持金（デフォルト: 1500） |
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
- ホスト自身を `POST /api/players` で登録（`is_host: true`）
- `sessionStorage` に `playerId` と `isHost: true` を保存
- StartSettingGame へ遷移

**B. ゲーム参加（一般プレイヤー）**
- URLパラメータから `join_token` を取得
- `GET /api/games/:join_token` でゲーム存在確認
- ゲームが `playing` 状態の場合は参加不可（「既に開始されています」表示）
- 名前・色を入力後、`POST /api/players` で登録（`is_host: false`）
- `sessionStorage` に `playerId` と `isHost: false` を保存
- StartSettingGame へ遷移

**C. プレイヤーリスト同期**
- `GET /api/games/:join_token/players` で初期データ取得
- ActionCable (`GameChannel`) をサブスクライブ（`subscriptionRef` パターン）
- `PLAYER_ADDED` / `PLAYER_REMOVED` / `GAME_DELETED` / `GAME_STARTED` イベント対応
- QRコード・参加コード表示
- 「ゲームを開始」ボタンで `POST /api/games/:join_token/start` → PlayScreen へ遷移
- ゲーム開始済みの場合は自動的に PlayScreen へリダイレクト

**D. ゲーム開始**
- `POST /api/games/:join_token/start` でゲームステータスを `playing` に変更
- 全プレイヤーの所持金を `start_money` で初期化
- `GAME_STARTED` イベントをブロードキャスト
- ゲームが `waiting` 状態でない場合はエラー返却

**E. 退出処理（クリーンアップ）**
- `usePlayerCleanup` フック：明示的な `cleanupPlayer()` 呼び出しのみ（戻るボタン）
- `beforeunload` は削除済み（リロードとタブ閉じの区別不可のため）
- タブ閉じ時のクリーンアップはサーバーサイドで対応予定
- ホスト退出時: `game.destroy` → `GAME_DELETED` ブロードキャスト
- 一般プレイヤー退出時: `player.destroy` → `PLAYER_REMOVED` ブロードキャスト
- `isLeavingRef` で自身の退出時に `GAME_DELETED` アラートをスキップ

---

### フェーズ2: 送金管理フェーズ - 完了

#### 実装済み機能

**A. PlayScreen（メイン画面）**
- 全プレイヤーの所持金をリアルタイム表示
- 送金フォーム（送金元選択 + 送金先複数選択 + 金額入力）
- クイック金額ボタン（+1, +5, +10, +50, +100, +200, +500, C リセット）
- 取引履歴タブ

**B. 送金ロジック**
- **1対多送金**: 1人の送金元から複数の送金先へ同時送金
- **ホスト専用**: 銀行モード切り替え（`btn-warning` トグルボタン + 銀行アイコン）
- **全員共通**: 自分から他��レイヤーへの送金
- **残高チェック**: 銀行以外は残高不足時にアラート

**C. バックエンド（logs_controller）**
- `GET /api/games/:game_join_token/logs` - 取引履歴取得（sender, receivers含む）
- `POST /api/games/:game_join_token/logs` - 送金実行
  - `ActiveRecord::Base.transaction` でアトミック処理
  - 送金元の残高減額 + 各送金先の残高加算
  - `Log` + `LogReceiver` レコード作成
  - `MONEY_TRANSFERRED` イベントをブロードキャスト

---

### フェーズ3: ルーレット機能（構想段階）

- サイコロ・イベント抽選をアプリで代替
- アニメーション表示
- 結果の全体共有（ActionCable）

---

## 重要な実装ポイント

### 1. 状態管理とプレイヤー識別

| 項目 | 実装方法 | 目的 |
|------|----------|------|
| **自分の特定** | `sessionStorage` に `playerId` 保存 | タブ単位でプレイヤー識別 |
| **ホスト判定** | `sessionStorage` に `isHost` 保存 | 権限制御（銀行操作など） |
| **銀行の定義** | `sender_player_id` が NULL | ホストのみ操作可 |

**注意**: `localStorage` ではなく `sessionStorage` を使用（タブ単位の分離）。

### 2. ActionCableイベント設計

| イベント名 | 発火タイミング | ペイロード |
|-----------|--------------|-----------|
| `PLAYER_ADDED` | プレイヤー参加時 | `{ type, all_players }` |
| `PLAYER_REMOVED` | 一般プレイヤー退出時 | `{ type, all_players }` |
| `GAME_DELETED` | ホスト退出時 | `{ type, message }` |
| `GAME_STARTED` | ゲーム開始時 | `{ type, game, players }` |
| `MONEY_TRANSFERRED` | 送金実行時 | `{ type, all_players, log }` |

### 3. クリーンアップ戦略

- 明示的な「戻る」ボタンでのみ `cleanupPlayer()` を呼び出し
- `beforeunload` は使用しない（リロード時にsessionStorageが消える問題を防止）
- タブ閉じ時のクリーンアップはサーバーサイド（ActionCable disconnect）で対応予定

### 4. join_token の安定性

- `generate_join_token` は `before_validation` で実行
- `return if join_token.present?` により、`game.update` 時にトークンが変わらないことを保証

---

## API エンドポイント一覧

### Games

| メソッド | パス | 説明 | 実装状況 |
|---------|------|------|---------|
| GET | `/api/games` | 全ゲーム取得 | 実装済み |
| POST | `/api/games` | ゲーム作成 | 実装済み |
| GET | `/api/games/:join_token` | ゲーム詳細取得 | 実装済み |
| DELETE | `/api/games/:id` | ゲーム削除 | 実装済み |
| POST | `/api/games/:join_token/start` | ゲーム開始 | 実装済み |

### Players

| メソッド | パス | 説明 | 実装状況 |
|---------|------|------|---------|
| GET | `/api/games/:join_token/players` | ゲーム内プレイヤーリスト | 実装済み |
| POST | `/api/players` | プレイヤー作成（ゲーム開始後は不可） | 実装済み |
| PUT | `/api/players/:id` | プレイヤー更新 | 実装済み |
| DELETE | `/api/players/:id` | プレイヤー削除（ホスト時はゲーム削除） | 実装済み |

### Logs (送金)

| メソッド | パス | 説明 | 実装状況 |
|---------|------|------|---------|
| GET | `/api/games/:game_join_token/logs` | 送金履歴取得 | 実装済み |
| POST | `/api/games/:game_join_token/logs` | 送金実行（1対多対応） | 実装済み |

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
  type: "PLAYER_ADDED" | "PLAYER_REMOVED" | "GAME_DELETED" | "GAME_STARTED" | "MONEY_TRANSFERRED";
  player?: Player;
  all_players: Player[];
  message?: string;
  log?: TransactionLog;
}
```

---

## 次のステップ（優先順位順）

### 優先度 高

1. **タブ閉じ時のサーバーサイドクリーンアップ**
   - ActionCable disconnect で幽霊プレイヤーを削除

2. **ゲーム終了機能**
   - ホストがゲームを終了 → 結果画面表示

### 優先度 中

3. **ホスト交代機能**
   - 現ホストが次ホストを指定

4. **送金の取り消し・修正機能**
   - 誤送金の修正対応

### 優先度 低

5. **フェーズ3: ルーレット機能**
   - サイコロ・イベント抽選

---

## セキュリティ・注意事項

1. **CORS設定**: Rails側で `config/initializers/cors.rb` を設定済みか確認
2. **join_tokenの安全性**: 8文字のbase58、`before_validation` で生成（既存時はスキップ）
3. **プレイヤー削除の認証**: 現状、誰でも他人のIDで削除可能 → セッション管理が必要（将来的に）
4. **ActionCableの接続管理**: 複数タブ開いた場合の挙動を考慮
5. **ゲーム開始後の参加制限**: `players_controller#create` でゲームが `waiting` 状態かチェック

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

- **ActionCableが繋がらない**: `actionCable.ts` の接続URLを確認
- **プレイヤーリストが更新されない**: ブラウザコンソールで `GameChannel` のイベント受信を確認
- **QRコードが表示されない**: `QrCodeModal.tsx` のURL生成ロジックを確認
- **join_tokenが変わる**: `game.rb` の `generate_join_token` に `return if join_token.present?` があるか確認

---

**最終更新**: 2026-01-31

**現在のフェーズ**: フェーズ2（送金管理）完了
- フェーズ1: 初期設定（ゲーム作成・参加・同期・退出）完了
- フェーズ2: 送金管理（1対多送金・銀行機能・履歴表示）完了
- フェーズ3: ルーレット機能（構想段階）
