# ブログ記事作成ワークフロー

## セットアップ（初回のみ）

### 1. Gemini API キーの取得
[Google AI Studio](https://aistudio.google.com/) でAPIキーを取得する。

### 2. APIキーを .env に設定
プロジェクトルートの `.env` を開き、APIキーを入力する:
```
GEMINI_API_KEY=取得したAPIキー
```

### 3. .mcp.json の作成
```bash
cp .mcp.json.example .mcp.json
```
`.mcp.json` の `args` パスを自分の環境の絶対パスに合わせて書き換える（APIキーの記述は不要）。

### 4. MCPサーバーのビルド
```bash
cd mcp-servers/gemini-blog
npm install
npm run build
```

### 5. Claude Code の再起動
Claude Code を再起動すると `gemini_research` / `gemini_review` ツールが認識される。
（確認: Claude Code で `/mcp` コマンドを実行）

---

## 記事作成ワークフロー（毎回）

ユーザーが「〇〇についての記事を作成して」と指示したとき、Claude Code は以下の手順を順番に実行する。

### Step 1: ガイドライン読み込み + 既存スラッグ取得
`front/blog-src/automation/draft-guidelines.md` を読み、アプリの機能制約を確認する。

`front/blog-src/automation/article-index.txt` を読み、既存スラッグ一覧を取得する（1行1スラッグ）。

### Step 2: キーワード調査（Gemini）
`gemini_research` ツールを呼ぶ。
- `topic`: ユーザーが指定したテーマ
- `existing_articles`: article-index.txt の内容をカンマ区切りに変換して渡す

調査結果からslug・badge・H2構成を確定する。

### Step 3: 原稿作成（Claude）
draft-guidelines.md のルールに従いMarkdown原稿を作成する。
- 文字数: 5,000字以上（コメント・記号除く）
- CTA: 2箇所
- 保存先: `front/blog-src/drafts/creating/{slug}.md`

### Step 4: 推敲（Gemini）
`gemini_review` ツールを呼ぶ。
- `draft_content`: Step 3で作成した原稿全文

フィードバックを受け取り、必須修正・推奨改善を確認する。

### Step 5: 修正 + インデックス更新（Claude）
Gemini のフィードバックに基づき原稿を修正する。

修正完了後、`front/blog-src/automation/article-index.txt` の末尾に新しいスラッグを1行追記する。
修正箇所をユーザーに報告して完了。

---

## 文字数カウント方法

```python
import re
text = open('draft.md').read()
text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)  # コメント除去
text = re.sub(r'^slug:.*', '', text, flags=re.MULTILINE)
text = re.sub(r'^badge:.*', '', text, flags=re.MULTILINE)
text = re.sub(r'\|[-|: ]+\|', '', text)                 # 表区切り除去
text = re.sub(r'[#*|_`]', '', text)                      # 記号除去
count = len(re.sub(r'\s', '', text))
print(count)
```

---

## ディレクトリ構成

```
front/blog-src/
├── automation/
│   ├── workflow.md              ← このファイル
│   ├── article-index.txt        ← 既存スラッグ一覧（1行1スラッグ、記事追加時に自動追記）
│   ├── draft-guidelines.md     ← Claude用：原稿作成ルール
│   ├── keyword-research-prompt.md ← Gemini用：キーワード調査プロンプト
│   └── review-prompt.md        ← Gemini用：推敲プロンプト
├── drafts/
│   ├── creating/               ← 作成中の下書き
│   └── published/              ← 公開済みの下書き
└── pages/                      ← HTML変換済み（ビルド対象）
```
