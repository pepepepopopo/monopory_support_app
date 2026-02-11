import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: "serve-blog-static",
      configureServer(server) {
        // SPA fallback より先に /blog/ の静的ファイルを返す
        server.middlewares.use((req, _res, next) => {
          if (req.url?.startsWith("/blog")) {
            let filePath = req.url.split("?")[0];
            if (filePath.endsWith("/")) {
              filePath += "index.html";
            } else if (!path.extname(filePath)) {
              filePath += "/index.html";
            }
            const fullPath = path.join(__dirname, "public", filePath);
            if (fs.existsSync(fullPath)) {
              req.url = filePath;
            }
          }
          next();
        });
      },
    },
  ],
  server: {
    host: true,
  },
});