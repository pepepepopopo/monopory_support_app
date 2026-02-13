# マネサク - バックエンド

ボードゲームのお金管理をデジタル化する Web アプリの API サーバーです。

## 技術スタック

- Ruby on Rails 8
- PostgreSQL
- Puma
- ActionCable（WebSocket によるリアルタイム通信）
- JWT 認証
- Kamal（デプロイ）

## 主な機能

- ゲームの作成・参加管理
- プレイヤー間の送金処理
- リアルタイム残高同期（ActionCable）
- 取引履歴の記録

## セットアップ

```bash
bin/rails db:setup
bin/rails server
```
