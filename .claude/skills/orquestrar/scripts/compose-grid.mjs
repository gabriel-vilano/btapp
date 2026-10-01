// Monta vários prints numa imagem só, em grade e com legenda, para o SendUserFile.
//
// Uso: node compose-grid.mjs <saida.png> "<título>" <colunas> "<legenda>" <png> ["<legenda>" <png>] ...
//   ex.: node compose-grid.mjs "$SP/prints/pr114.png" "#114 · Confronto" 4 "Sem data" a.png "Combinado" b.png
//
// O SendUserFile recusa imagem alta: 8.500px ou mais voltaram com erro 400, até
// 3.400px passaram. Por isso a grade de 3 ou 4 colunas, e não a coluna única.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { launchBrowser } from "./browser.mjs";

const SAFE_HEIGHT = 3400;
const COLUMN_WIDTH = 393;

const [out, title, columnsArg, ...pairs] = process.argv.slice(2);
const columns = Number(columnsArg);
if (!out || !title || !Number.isInteger(columns) || pairs.length === 0 || pairs.length % 2 !== 0) {
  console.error('uso: node compose-grid.mjs <saida.png> "<título>" <colunas> "<legenda>" <png> ...');
  process.exit(2);
}

const escapeHtml = (text) =>
  text.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

const figures = [];
for (let i = 0; i < pairs.length; i += 2) {
  const src = pathToFileURL(resolve(pairs[i + 1])).href;
  figures.push(
    `<figure><figcaption>${escapeHtml(pairs[i])}</figcaption><img src="${src}"></figure>`,
  );
}

const width = columns * COLUMN_WIDTH + (columns - 1) * 24 + 48;
const html = `<!doctype html><meta charset="utf-8">
<style>
  body { margin: 0; padding: 24px; width: ${width - 48}px; font-family: Arial, sans-serif; background: #fff; color: #191919; }
  h1 { font-size: 28px; margin: 0 0 20px; }
  .grid { display: grid; grid-template-columns: repeat(${columns}, ${COLUMN_WIDTH}px); gap: 28px 24px; align-items: start; }
  figure { margin: 0; }
  figcaption { font-size: 18px; font-weight: bold; margin: 0 0 8px; color: #707070; min-height: 44px; }
  img { display: block; width: 100%; border: 1px solid #e5e5e5; }
</style>
<h1>${escapeHtml(title)}</h1>
<div class="grid">${figures.join("")}</div>`;

const htmlFile = resolve(out.replace(/\.png$/, ".html"));
writeFileSync(htmlFile, html);
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width, height: 600 } });
await page.goto(pathToFileURL(htmlFile).href, { waitUntil: "load" });
const height = await page.evaluate(() => document.documentElement.scrollHeight);
await page.screenshot({ path: out, fullPage: true });
await browser.close();

const warn = height > SAFE_HEIGHT ? `  ATENÇÃO ${height}px de altura: o SendUserFile pode recusar, use mais colunas` : "";
console.log(`ok ${out} ${width}x${height}${warn}`);
