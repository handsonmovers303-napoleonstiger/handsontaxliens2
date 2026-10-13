// Builds the claude.ai artifact: one HTML fragment with the CSS and JS inlined.
// Usage: node scripts/build-artifact.mjs [out.html]
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

execSync("npx vite build --mode artifact", { stdio: "inherit" });
const dir = "dist-artifact/assets";
const files = readdirSync(dir);
const css = files.filter((f) => f.endsWith(".css")).map((f) => readFileSync(`${dir}/${f}`, "utf8")).join("\n");
const js = files.filter((f) => f.endsWith(".js")).map((f) => readFileSync(`${dir}/${f}`, "utf8")).join("\n")
  .replace(/<\/script/gi, "<\\/script");
const out = process.argv[2] || "dist-artifact/artifact.html";
writeFileSync(out, `<title>Hands On Tax Liens</title>
<meta name="theme-color" content="#05060A">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Cormorant+Garamond:wght@500;600&family=Oswald:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`);
console.log(`artifact written: ${out} (${(Buffer.byteLength(readFileSync(out)) / 1e6).toFixed(2)} MB)`);
