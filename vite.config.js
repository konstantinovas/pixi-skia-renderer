import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : "/pixi-skia-renderer/",
  build: {
    outDir: "docs", //собираем в docs для публикации в github
  },
}));
