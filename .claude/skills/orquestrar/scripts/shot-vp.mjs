// Print de stories do Storybook no viewport do celular, depois do `play`.
//
// Uso: node shot-vp.mjs <base-url> <pasta> <story-id>[@<largura>x<altura>] ... [--full]
//   ex.: node shot-vp.mjs http://localhost:6123 "$SP/prints" agenda-matchscreen--no-date ui-button--primary@430
//   padrão 393x852 a 2x; --full captura a altura inteira em vez da primeira tela.
//
// Para cada story, imprime o estado do `play` e o overflow horizontal.
// Overflow > 0 é conteúdo mais largo que a tela: olhar o print antes de levar ao Gabriel.
import { launchBrowser, parseViewport } from "./browser.mjs";

const FINAL_PHASES = ["completed", "errored", "aborted"];

const args = process.argv.slice(2);
const full = args.includes("--full");
const [base, outDir, ...specs] = args.filter((arg) => arg !== "--full");
if (!base || !outDir || specs.length === 0) {
  console.error("uso: node shot-vp.mjs <base-url> <pasta> <story-id>[@393x852] ... [--full]");
  process.exit(2);
}

// O Storybook avisa o fim do `play` pelo canal do preview. O canal nasce depois
// dos scripts da página, então o hook espera por ele.
function listenToStoryEvents() {
  window.__shot = { done: false, error: null };
  const hook = setInterval(() => {
    const channel = window.__STORYBOOK_ADDONS_CHANNEL__;
    if (!channel) return;
    clearInterval(hook);
    channel.on("storyRendered", () => (window.__shot.done = true));
    channel.on("storyMissing", () => {
      window.__shot.missing = true;
      window.__shot.done = true;
    });
    for (const event of ["playFunctionThrewException", "storyThrewException", "storyErrored"]) {
      channel.on(event, (payload) => {
        window.__shot.error = String(payload?.message ?? payload?.title ?? event);
        window.__shot.done = true;
      });
    }
  }, 5);
}

function storyFinished(phases) {
  const phase = window.__STORYBOOK_PREVIEW__?.currentRender?.phase;
  return window.__shot?.done || phases.includes(phase);
}

// A moldura .sb-screen-frame tem 393px fixos dentro do padding do Storybook:
// medir o documento dá um falso 409px. Com moldura, mede só o conteúdo dela.
function measureOverflow() {
  const frame = document.querySelector(".sb-screen-frame");
  if (frame) return frame.scrollWidth - frame.clientWidth;
  // Sem overflow, a diferença pode sair negativa (barra de rolagem): vale 0.
  return Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
}

function frameRect() {
  const frame = document.querySelector(".sb-screen-frame");
  if (!frame) return null;
  const rect = frame.getBoundingClientRect();
  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
}

async function shootStory(page, spec) {
  const [id, size] = spec.split("@");
  const viewport = parseViewport(size);
  await page.setViewportSize(viewport);
  await page.goto(`${base}/iframe.html?id=${id}&viewMode=story`, { waitUntil: "load" });
  await page.waitForFunction(storyFinished, FINAL_PHASES, { timeout: 20_000 });
  await page.evaluate(() => document.fonts.ready);
  if (await page.evaluate(() => window.__shot?.missing)) {
    throw new Error(`a story '${id}' não existe neste build: conferir o id no index.json`);
  }
  const overflow = await page.evaluate(measureOverflow);
  const playError = await page.evaluate(() => window.__shot?.error ?? null);
  const file = `${outDir}/${id}-${viewport.width}.png`;
  const frame = await page.evaluate(frameRect);
  if (frame && frame.x + frame.width > viewport.width) {
    // Sem cortar a lateral da moldura: alarga o viewport e recorta a moldura.
    await page.setViewportSize({ width: Math.ceil(frame.x * 2 + frame.width), height: viewport.height });
    const height = full ? frame.height : Math.min(frame.height, viewport.height - frame.y);
    await page.screenshot({ path: file, fullPage: full, clip: { ...frame, height } });
  } else {
    await page.screenshot({ path: file, fullPage: full });
  }
  const status = playError ? `play falhou: ${playError}` : "play ok";
  const warn = overflow > 0 ? `  ATENÇÃO overflow ${overflow}px` : "";
  console.log(`ok ${id} ${viewport.width}x${viewport.height} ${status} overflow ${overflow}px${warn}`);
  return playError === null;
}

const browser = await launchBrowser();
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.addInitScript(listenToStoryEvents);
let failures = 0;
for (const spec of specs) {
  try {
    if (!(await shootStory(page, spec))) failures += 1;
  } catch (error) {
    failures += 1;
    console.log(`ERRO ${spec}: ${error.message.split("\n")[0]}`);
  }
}
await browser.close();
process.exit(failures > 0 ? 1 : 0);
