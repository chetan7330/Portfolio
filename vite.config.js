import { defineConfig } from "vite";

export default defineConfig({
  plugins: [{
    name: "portfolio-social-metadata",
    transformIndexHtml(html) {
      const siteUrl = process.env.VITE_STATIC_SITE === "true"
        ? "https://chetan7330.github.io/Portfolio/"
        : "https://chetan-portfolio-ouokerdc4e.central-india.ci.tower.cloud/";
      return html.replaceAll("__SITE_URL__", siteUrl);
    },
  }],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: { "/api": "http://127.0.0.1:3000" },
  },
  build: { target: "es2022" },
});
