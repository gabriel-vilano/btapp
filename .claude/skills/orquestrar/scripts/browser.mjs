// Chromium compartilhado pelos scripts de print.
// O container da nuvem traz o Chromium em /opt/pw-browsers e proíbe o
// `playwright install`; fora dele, vale o browser do próprio Playwright.
import { existsSync } from "node:fs";
import { chromium } from "playwright";

const CONTAINER_CHROMIUM = "/opt/pw-browsers/chromium";

export function launchBrowser() {
  const executablePath =
    process.env.CHROMIUM_EXECUTABLE_PATH ??
    (existsSync(CONTAINER_CHROMIUM) ? CONTAINER_CHROMIUM : undefined);
  return chromium.launch({ executablePath });
}

/** Lê "393x852" ou "393"; o que faltar vem do padrão (o mobile base do app). */
export function parseViewport(spec, fallback = { width: 393, height: 852 }) {
  if (!spec) return fallback;
  const match = /^(\d+)(?:x(\d+))?$/.exec(spec);
  if (!match) throw new Error(`Viewport inválido: recebi '${spec}', esperado <largura> ou <largura>x<altura>, ex.: 393x852`);
  return { width: Number(match[1]), height: Number(match[2] ?? fallback.height) };
}
