# マネサク（Money Saku-Saku Support）

ボードゲームのお金管理をデジタル化する無料 Web アプリ。
モノポリー・人生ゲームなど、紙の紙幣を使うボードゲームの銀行係をアプリに置き換え、全員がゲームに集中できるようにします。

**URL:** https://manesaku.com

## 技術スタック

| 区分 | 使用技術 |
|------|----------|
| フロントエンド | Vite 7 + React 19 + TypeScript + Tailwind CSS v4 + DaisyUI v5 |
| バックエンド | Ruby on Rails 8 (API mode) + ActionCable |
| データベース | PostgreSQL (Neon) |
| 認証 | JWT |
| iOS | Capacitor |
| デプロイ | Render + Kamal |

## 機能一覧

### ゲーム管理

- **ゲーム作成** — ホストがルームを作成し、参加コード・QRコードを発行
- **ゲーム参加** — 参加コードまたはQRコードでゲームに参加
- **プレイヤー設定** — 名前・識別カラーを登録
- **初期所持金設定** — ホストが開始前に初期金額を設定（デフォルト: 15,000）
- **リアルタイム同期** — ActionCable でプレイヤーの参加・退出をリアルタイム反映
- **ゲーム開始 / 終了** — ホストが開始・終了を操作、最終順位を表示

### 送金・銀行

- **プレイヤー間送金** — 1対1、1対多の送金に対応
- **銀行機能** — ホストが銀行として無制限の入出金を操作
- **クイック入力** — +1, +5, +10, +50, +100, +200, +500 のボタンで素早く入力
- **電卓機能** — 四則演算対応の内蔵電卓。計算結果をそのまま送金額に反映
- **残高バリデーション** — 所持金を超える送金を自動ブロック
- **残高表示** — 全プレイヤーの所持金をリアルタイム表示
- **取引履歴** — 送金ログを時系列で確認（トラブル防止）

### ブログ（SEO）

- 静的 HTML ページ（`front/public/blog/`）
- テーマ色の一元管理（`front/public/blog/theme.js`）
- URL 構造: `/blog/board-game/{slug}/`
- 全 8 記事（使い方ガイド、銀行係デジタル化、家族向け活用術など）

## ディレクトリ構成

```
monopory_support_app/
├── front/          # React SPA + 静的ブログページ
├── back/           # Rails API サーバー
└── README.md
```

## セットアップ

### バックエンド

```bash
cd back
bin/rails db:setup
bin/rails server
```

### フロントエンド

```bash
cd front
npm install
npm run dev
```

## 画面遷移

```
トップ (/)
├── ゲーム作成 (/games)
│     ├── 参加画面 (/games/:token/join)
│     ├── 設定画面 (/games/:token/startSetting)
│     ├── プレイ画面 (/games/:token/play)
│     └── 結果画面 (/games/:token/result)
├── ブログ (/blog/)
│     └── 記事 (/blog/board-game/:slug/)
├── プライバシーポリシー (/privacy)
├── 利用規約 (/terms)
└── お問い合わせ (/contact)
```
