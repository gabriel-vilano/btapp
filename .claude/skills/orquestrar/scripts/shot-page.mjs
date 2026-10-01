// Print de uma página do app (não de componente), como `next dev` ou `next start`.
//
// Uso: node shot-page.mjs <url> <saida.png> [<largura>x<altura>] [--full]
//   ex.: node shot-page.mjs http://localhost:3100/login "$SP/prints/login.png" 393x852
//
// Sem Supabase local, só as páginas públicas (auth) abrem: o proxy.ts manda o
// resto para o login. Para telas logadas, preferir as stories.
import { launchBrowser, parseViewport } from "./browser.mjs";

const args = process.argv.slice(2);
const full = args.includes("--full");
const [url, out, size] = args.filter((arg) => arg !== "--full");
if (!url || !out) {
  console.error("uso: node shot-page.mjs <url> <saida.png> [393x852] [--full]");
  process.exit(2);
}

const viewport = parseViewport(size);
const browser = await launchBrowser();
const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
const response = await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));
await page.screenshot({ path: out, fullPage: full });
await browser.close();

const warn = overflow > 0 ? `  ATENÇÃO overflow ${overflow}px` : "";
console.log(`ok ${page.url()} HTTP ${response?.status()} ${viewport.width}x${viewport.height} overflow ${overflow}px${warn}`);
