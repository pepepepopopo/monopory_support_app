import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
// dist/index.js → mcp-servers/gemini-blog/ → mcp-servers/ → project root
const PROJECT_ROOT = resolve(__dirname, "../../..");
config({ path: join(PROJECT_ROOT, ".env") });

const PROMPTS_DIR = join(PROJECT_ROOT, "front/blog-src/automation");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set. プロジェクトルートの .env に GEMINI_API_KEY=xxx を追加してください。");
}

const genAI = new GoogleGenerativeAI(apiKey);

function loadPrompt(filename: string): string {
  return readFileSync(join(PROMPTS_DIR, filename), "utf-8");
}

const server = new Server(
  { name: "gemini-blog", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "gemini_research",
      description:
        "Gemini + Google Search でブログ記事のキーワード調査を行う。対象キーワード・検索意図・差別化ポイント・推奨構成・内部リンク候補を返す。",
      inputSchema: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "記事テーマ（例: 人生ゲームの精算）",
          },
          existing_articles: {
            type: "string",
            description:
              "既存記事のスラッグをカンマ区切りで（重複回避用）。例: life-game-banker,life-game-rules",
          },
        },
        required: ["topic"],
      },
    },
    {
      name: "gemini_review",
      description:
        "Gemini でブログ原稿を推敲する。文字数・構成・CTAの自然さ・アプリ機能の正確さ・SEO観点でフィードバックを返す。",
      inputSchema: {
        type: "object",
        properties: {
          draft_content: {
            type: "string",
            description: "推敲対象の原稿全文（Markdown形式）",
          },
        },
        required: ["draft_content"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "gemini_research") {
    const topic = args?.topic as string;
    const existingArticles = (args?.existing_articles as string) ?? "";

    const promptTemplate = loadPrompt("keyword-research-prompt.md");
    const prompt = promptTemplate
      .replace("{{TOPIC}}", topic)
      .replace("{{EXISTING_ARTICLES}}", existingArticles);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      tools: [{ googleSearch: {} }] as never,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return {
      content: [{ type: "text", text }],
    };
  }

  if (name === "gemini_review") {
    const draftContent = args?.draft_content as string;

    const promptTemplate = loadPrompt("review-prompt.md");
    const prompt = promptTemplate.replace("{{DRAFT}}", draftContent);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return {
      content: [{ type: "text", text }],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
