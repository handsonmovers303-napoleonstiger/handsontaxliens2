import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// BASE_PATH is set by the Pages workflow ("/handsontaxliens/"); local dev serves from "/".
// `--mode artifact` builds one inlinable bundle for the claude.ai artifact (scripts/build-artifact.mjs).
function whpProxy() {
  return {
    target: "https://imagery.geoplatform.gov",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/gis\/whp/, "/iipp/rest/services/Fire_Aviation/USFS_EDW_RMRS_WildfireHazardPotentialClassified/ImageServer"),
    configure(proxy) {
      proxy.on("proxyReq", (proxyReq) => {
        for (const name of ["origin", "referer", "sec-fetch-mode", "sec-fetch-site", "sec-fetch-dest", "sec-fetch-user", "cookie"]) {
          proxyReq.removeHeader(name);
        }
        proxyReq.setHeader("user-agent", "HandsOnTaxLiens/gis");
        proxyReq.setHeader("accept", "image/png,*/*");
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: mode === "artifact" ? "./" : process.env.BASE_PATH || "/",
  plugins: [react()],
  server: {
    proxy: {
      "/api/push": "http://127.0.0.1:8787",
      "/api/gis/whp": whpProxy(),
    },
  },
  preview: {
    proxy: {
      "/api/gis/whp": whpProxy(),
    },
  },
  define: mode === "artifact" ? { "import.meta.env.VITE_ARTIFACT": JSON.stringify("1") } : {},
  build: {
    chunkSizeWarningLimit: 6000, sourcemap: false,
    outDir: mode === "artifact" ? "dist-artifact" : "dist",
    rollupOptions: mode === "artifact" ? { output: { inlineDynamicImports: true } } : {},
  },
}));
