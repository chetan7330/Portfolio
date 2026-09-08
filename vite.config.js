import { defineConfig } from "vite";

export default defineConfig({
  plugins: [{
    name: "portfolio-social-metadata",
    transformIndexHtml(html) {
      const siteUrl = "https://chetankrishna.in/";
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
