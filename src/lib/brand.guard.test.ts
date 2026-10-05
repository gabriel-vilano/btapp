import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";
import { brand } from "./brand";

// Guarda da regra do nome (comentário de `brand.ts`): em src/, app/ e e2e/ o
// nome do produto só entra por `brand`, e o nome antigo não entra de jeito
// nenhum. Regra em prosa decai com vários agentes em paralelo; o teste roda na
// CI obrigatória e aponta arquivo e linha.

const ROOT = path.join(__dirname, "..", "..");
const SCANNED_DIRS = ["src", "app", "e2e"];
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".mdx", ".md", ".css", ".json"]);
const BRAND_SOURCE = "src/lib/brand.ts";

// Caminhos relativos à raiz que podem citar um dos nomes. Cada entrada leva o motivo.
const ALLOWLIST: readonly string[] = [];

// Montados por concatenação para este arquivo não casar consigo mesmo
const OLD_NAME_PATTERNS = [
  new RegExp("letz" + "\\s?" + "play", "i"),
  new RegExp("lp" + "tennis", "i"),
  new RegExp("letz" + "play" + "\\.me", "i"),
];

type Hit = { file: string; line: number; text: string };

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Limite de palavra feito à mão: `\b` não trata letra acentuada como letra
function literalPattern(value: string): RegExp {
  return new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegExp(value)}(?![\\p{L}\\p{N}_])`, "u");
}

function scannedFiles(): string[] {
  return SCANNED_DIRS.flatMap((dir) =>
    readdirSync(path.join(ROOT, dir), { recursive: true, encoding: "utf8" })
      .map((entry) => path.posix.join(dir, entry.split(path.sep).join("/")))
      .filter((file) => TEXT_EXTENSIONS.has(path.extname(file)))
      .filter((file) => !ALLOWLIST.includes(file)),
  );
}

function findHits(files: string[], patterns: RegExp[]): Hit[] {
  return files.flatMap((file) =>
    readFileSync(path.join(ROOT, file), "utf8")
      .split("\n")
      .map((text, index) => ({ file, line: index + 1, text: text.trim() }))
      .filter((hit) => patterns.some((pattern) => pattern.test(hit.text))),
  );
}

function report(hits: Hit[]): string {
  return hits.map((hit) => `${hit.file}:${hit.line}  ${hit.text}`).join("\n");
}

describe("guarda do nome do produto", () => {
  const files = scannedFiles();

  it("varre arquivos de src/, app/ e e2e/", () => {
    expect(files.length).toBeGreaterThan(100);
    expect(files).toContain(BRAND_SOURCE);
  });

  it("nenhum arquivo cita o nome antigo", () => {
    const hits = findHits(files, OLD_NAME_PATTERNS);
    expect(hits, `Nome antigo encontrado; use brand.name (src/lib/brand.ts):\n${report(hits)}`).toEqual([]);
  });

  it("o nome atual só aparece como literal em src/lib/brand.ts", () => {
    const patterns = [...new Set(Object.values(brand))].map(literalPattern);
    const hits = findHits(files.filter((file) => file !== BRAND_SOURCE), patterns);
    expect(hits, `Literal de brand.name fora de ${BRAND_SOURCE}; importe brand:\n${report(hits)}`).toEqual([]);
  });
});
