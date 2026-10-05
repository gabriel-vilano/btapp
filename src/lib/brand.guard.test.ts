import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";
import { brand } from "./brand";

// Guarda da regra do nome (comentário de `brand.ts`): o nome antigo não entra
// em lugar nenhum do repo, e o nome atual só entra como literal em
// src/lib/brand.ts e nos lugares da lista do comentário dele. Regra em prosa
// decai com vários agentes em paralelo; o teste roda na CI obrigatória e
// aponta arquivo e linha.

const ROOT = path.join(__dirname, "..", "..");
const BRAND_SOURCE = "src/lib/brand.ts";

// Onde o literal do nome atual é permitido, porque o TypeScript não alcança.
// Espelha a lista do comentário de brand.ts (o último teste confere que batem).
// Entrada terminada em "/" vale para a pasta inteira.
const LITERAL_ALLOWED: readonly string[] = [
  "supabase/", // templates de e-mail e `subject` do config.toml
  ".claude/", // skills, scripts e textos dos agentes
  "README.md", // título e apresentação do repo
  "docs/PRODUCT.md", // o único doc que diz o nome (regra "Marca" do CLAUDE.md)
];

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

// Entre as palavras do nome vale qualquer espaço: o comum, o que não quebra
// (U+00A0, cru ou escrito como `&nbsp;`, `&#160;` ou ` ` no código)
const NAME_SEPARATOR = "(?:\\s|&nbsp;|&#160;|\\\\u00[aA]0)";

// Limite de palavra feito à mão: `\b` não trata letra acentuada como letra
function literalPattern(value: string): RegExp {
  const words = value.split(/\s+/).map(escapeRegExp).join(NAME_SEPARATOR);
  return new RegExp(`(?<![\\p{L}\\p{N}_])${words}(?![\\p{L}\\p{N}_])`, "u");
}

// Arquivos versionados e os novos ainda fora do índice (sem os ignorados,
// como node_modules/ e .next/). Binário (com byte nulo) fica de fora.
function repoTextFiles(): Map<string, string> {
  const listed = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const contents = new Map<string, string>();
  for (const file of listed.split("\0").filter(Boolean)) {
    const fullPath = path.join(ROOT, file);
    if (!existsSync(fullPath)) continue;
    const text = readFileSync(fullPath, "utf8");
    if (!text.includes("\0")) contents.set(file, text);
  }
  return contents;
}

function isLiteralAllowed(file: string): boolean {
  if (file === BRAND_SOURCE) return true;
  return LITERAL_ALLOWED.some((place) => (place.endsWith("/") ? file.startsWith(place) : file === place));
}

function findHits(files: Map<string, string>, patterns: RegExp[]): Hit[] {
  return [...files].flatMap(([file, text]) =>
    text
      .split("\n")
      .map((line, index) => ({ file, line: index + 1, text: line.trim() }))
      .filter((hit) => patterns.some((pattern) => pattern.test(hit.text))),
  );
}

function report(hits: Hit[]): string {
  return hits.map((hit) => `${hit.file}:${hit.line}  ${hit.text.slice(0, 160)}`).join("\n");
}

// Os caminhos da lista do comentário de brand.ts: as linhas `//   - <caminho>`
function brandCommentPlaces(files: Map<string, string>): string[] {
  const source = files.get(BRAND_SOURCE) ?? "";
  return [...source.matchAll(/^\/\/\s+-\s+(\S+)/gm)].map((match) => match[1]);
}

describe("guarda do nome do produto", () => {
  const files = repoTextFiles();

  it("varre o repo todo, inclusive .claude/, supabase/, docs/ e a raiz", () => {
    expect(files.size).toBeGreaterThan(300);
    for (const file of [BRAND_SOURCE, "CLAUDE.md", "package.json", ".claude/skills/pegar-issue/SKILL.md", "supabase/config.toml", "docs/DOMAIN.md"]) {
      expect(files.has(file), `${file} deveria estar na varredura`).toBe(true);
    }
  });

  it("nenhum arquivo cita o nome antigo", () => {
    const hits = findHits(files, OLD_NAME_PATTERNS);
    expect(hits, `Nome antigo encontrado; troque pelo nome atual ou por "o produto":\n${report(hits)}`).toEqual([]);
  });

  it("o nome atual só aparece como literal em brand.ts e nos lugares permitidos", () => {
    const patterns = [...new Set(Object.values(brand))].map(literalPattern);
    const outside = new Map([...files].filter(([file]) => !isLiteralAllowed(file)));
    const hits = findHits(outside, patterns);
    expect(hits, `Literal de brand.name fora de ${BRAND_SOURCE}; importe brand (código) ou escreva "o produto" (docs):\n${report(hits)}`).toEqual([]);
  });

  it("a lista do comentário de brand.ts e a allowlist deste teste batem", () => {
    expect(brandCommentPlaces(files).sort()).toEqual([...LITERAL_ALLOWED].sort());
  });
});
