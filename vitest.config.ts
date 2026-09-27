import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

import { playwright } from "@vitest/browser-playwright";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// Sessões do Claude Code na nuvem trazem um Chromium mais antigo que o pedido pelo
// `playwright` do projeto e não podem rodar `playwright install` (ENG-34). Nelas,
// a variável aponta para o Chromium do container. Vazia (CI, máquina local), o
// Playwright usa o browser que ele mesmo instalou.
const chromiumExecutablePath = process.env.CHROMIUM_EXECUTABLE_PATH;
const chromiumProvider = chromiumExecutablePath
  ? playwright({ launchOptions: { executablePath: chromiumExecutablePath } })
  : playwright({});

// Dois projects:
// - "unit": testes node puros (validations, server actions etc.). É o que `npm test` roda.
// - "storybook": cada story vira teste no browser via Playwright + Chromium.
//   Roda com `npm run test:stories` (mais lento, requer browser).
//
// Docs: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        // Espelha o `paths` do tsconfig: as server actions importam via `@/src/...`.
        resolve: {
          alias: { "@": dirname },
        },
        test: {
          name: "unit",
          include: ["src/**/*.test.{ts,tsx}", "app/**/*.test.{ts,tsx}", "*.test.ts"],
          exclude: ["src/**/*.stories.{ts,tsx}", "node_modules/**"],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: chromiumProvider,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
