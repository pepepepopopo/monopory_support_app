#!/usr/bin/env node
/**
 * Blog Build Script
 *
 * Assembles blog pages from:
 *   - blog-src/pages/*.html     (frontmatter + body)
 *   - blog-src/templates/       (article.html, index.html)
 *   - blog-src/partials/        (head-common, blog-content.css, header, cta, footer)
 *
 * Output: front/blog/ (index.html + board-game/{slug}/index.html)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = __dirname;
const OUT = path.resolve(ROOT, "..", "blog");

// ── helpers ──────────────────────────────────────────────

function readFile(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

/** Parse `---` delimited frontmatter → { meta: {}, body: string } */
function parsePage(raw) {
  const lines = raw.split("\n");
  if (lines[0].trim() !== "---") throw new Error("Missing opening ---");

  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIdx = i;
      break;
    }
  }
  if (endIdx === -1) throw new Error("Missing closing ---");

  const meta = {};
  for (let i = 1; i < endIdx; i++) {
    const colon = lines[i].indexOf(":");
    if (colon === -1) continue;
    const key = lines[i].slice(0, colon).trim();
    const val = lines[i].slice(colon + 1).trim();
    meta[key] = val;
  }

  const body = lines.slice(endIdx + 1).join("\n");
  return { meta, body };
}

/** Extract <style>...</style> from body, return { css, bodyWithoutStyle } */
function extractStyle(body) {
  const re = /<style>([\s\S]*?)<\/style>/;
  const m = body.match(re);
  if (!m) return { css: "", bodyWithoutStyle: body };
  return {
    css: m[1],
    bodyWithoutStyle: body.replace(re, "").replace(/^\s*\n/, ""),
  };
}

/** Replace all {{key}} placeholders in template */
function render(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return vars[key] !== undefined ? vars[key] : `{{${key}}}`;
  });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// ── load partials & templates ────────────────────────────

const headCommon = readFile("partials/head-common.html");
const blogContentCss = readFile("partials/blog-content.css");
const headerHtml = readFile("partials/header.html");
const ctaHtml = readFile("partials/cta.html");
const footerHtml = readFile("partials/footer.html");

const articleTemplate = readFile("templates/article.html");
const indexTemplate = readFile("templates/index.html");

// ── load pages ───────────────────────────────────────────

const pagesDir = path.join(ROOT, "pages");
const pageFiles = fs
  .readdirSync(pagesDir)
  .filter((f) => f.endsWith(".html"))
  .sort();

const pages = pageFiles.map((file) => {
  const raw = fs.readFileSync(path.join(pagesDir, file), "utf-8");
  return parsePage(raw);
});

// Sort by date descending (newest first)
pages.sort((a, b) => (a.meta.date > b.meta.date ? -1 : 1));

// ── build article pages ─────────────────────────────────

ensureDir(OUT);

for (const page of pages) {
  const { meta, body } = page;
  const { css: pageSpecificCss, bodyWithoutStyle } = extractStyle(body);

  const cta = render(ctaHtml, meta);

  const vars = {
    ...meta,
    headCommon,
    blogContentCss,
    pageSpecificCss,
    header: headerHtml,
    body: bodyWithoutStyle,
    cta,
    footer: footerHtml,
  };

  const html = render(articleTemplate, vars);

  const outDir = path.join(OUT, "board-game", meta.slug);
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf-8");
  console.log(`  ✓ blog/board-game/${meta.slug}/index.html`);
}

// ── build index page ─────────────────────────────────────

const badgeColors = ["primary", "secondary", "accent", "info"];

const articleCards = pages
  .map((page, i) => {
    const m = page.meta;
    const color = badgeColors[i % badgeColors.length];
    return `        <!-- Article ${i + 1} -->
        <a href="/blog/board-game/${m.slug}/" class="article-card card bg-base-100 shadow-sm hover:shadow-lg block border-l-4 border-${color}">
          <div class="card-body p-5 flex-row gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-${color}/10 flex items-center justify-center">
              <span class="text-2xl">${m.emoji || ""}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <time class="text-xs opacity-50">${m.displayDate}</time>
                <span class="badge badge-${m.badgeColor} badge-sm">${m.badge}</span>
                <span class="badge badge-ghost badge-sm">${(m.readingTime || "").replace("で読める", "")}</span>
              </div>
              <h2 class="font-bold text-base md:text-lg leading-snug">${m.title}</h2>
              <p class="text-sm opacity-60 mt-1.5 line-clamp-2">${m.excerpt}</p>
              <span class="inline-block mt-2 text-xs font-bold text-${color}">続きを読む →</span>
            </div>
          </div>
        </a>`;
  })
  .join("\n\n");

const indexHtml = render(indexTemplate, {
  headCommon,
  articleCards,
});

fs.writeFileSync(path.join(OUT, "index.html"), indexHtml, "utf-8");
console.log(`  ✓ blog/index.html`);

console.log(`\nBuild complete! ${pages.length} articles + index → blog/`);
