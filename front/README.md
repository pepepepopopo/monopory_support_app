# マネサク - フロントエンド

ボードゲームのお金管理をデジタル化する Web アプリのフロントエンドです。

## 技術スタック

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4 + DaisyUI v5（lemonade テーマ）
- React Router v7
- ActionCable（リアルタイム通信）
- Capacitor（iOS アプリ対応）

## セットアップ

```bash
npm install
npm run dev
```

## ブログ（静的ページ）

SEO 用の静的 HTML ページは `public/blog/` に配置しています。

- Tailwind ブラウザ CDN + DaisyUI CDN を使用
- テーマ色の登録は `public/blog/theme.js` で一元管理
- URL 構造: `/blog/board-game/{slug}/`

### 記事一覧

| スラッグ | タイトル |
|---|---|
| banker-tips | モノポリーの銀行役が面倒？負担をゼロにする方法 |
| money-shortage | 人生ゲームでお金が足りない！原因と対策まとめ |
| money-management | ボードゲームの現金管理を効率化する3つの方法 |
| money-education | 子供のお金教育にボードゲームが効果的な理由 |
| how-to-use | マネサクの使い方ガイド |
| digital-banking | ボードゲームの銀行係をデジタル化するメリット5つ |
| family-game-night | 家族のボードゲームタイムにアプリを活用する方法 |
| calculator-tips | ボードゲーム中の計算トラブルを防ぐ方法 |

## ビルド

```bash
npm run build
```
