#!/usr/bin/env node
// Custo fixo de contexto (método A do PRD-38, seção 5): estima os tokens de
// instrução que o agente recebe no início de TODA sessão.
// Uso: node scripts/context-cost.mjs [raiz-do-repo]
// Sai com 1 se alguma regra não tiver `paths` válido ou se o CLAUDE.md passar de 150 linhas.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const CHARS_PER_TOKEN = 3.5;
const MAX_IMPORT_DEPTH = 4; // limite da doc do Claude Code
const MAX_CLAUDE_MD_LINES = 150;

const root = resolve(process.argv[2] ?? ".");

// Comentário HTML em bloco é removido antes de carregar (doc do Claude Code).
const stripHtmlComments = (text) => text.replace(/<!--[\s\S]*?-->/g, "");

const toTokens = (chars) => Math.round(chars / CHARS_PER_TOKEN);

const lineCount = (text) => text.split("\n").length - (text.endsWith("\n") ? 1 : 0);

// `@caminho` no início de linha, fora de bloco de código.
function findImports(text) {
  const imports = [];
  let inFence = false;
  for (const line of text.split("\n")) {
    if (line.trimStart().startsWith("```")) inFence = !inFence;
    const match = !inFence && line.match(/^\s*@(\S+)\s*$/);
    if (match) imports.push(match[1]);
  }
  return imports;
}

// Segue os `@` recursivamente; cada arquivo conta uma vez só.
function collectFixedFiles(entry) {
  const seen = new Map();
  const visit = (file, depth) => {
    if (seen.has(file) || depth > MAX_IMPORT_DEPTH || !existsSync(file)) return;
    const text = stripHtmlComments(readFileSync(file, "utf8"));
    seen.set(file, text);
    for (const target of findImports(text)) visit(resolve(dirname(file), target), depth + 1);
  };
  visit(entry, 0);
  return seen;
}

// Frontmatter YAML mínimo: só a chave `paths` como lista (itens com `- `).
function parseRule(raw, name) {
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const body = fm ? raw.slice(fm[0].length) : raw;
  if (!fm) return { body, paths: null };
  const block = fm[1].match(/^paths:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (!block) {
    if (/^paths:/m.test(fm[1])) throw new Error(`${name}: 'paths' precisa ser lista YAML ("- \\"glob\\""), recebi '${fm[1]}'`);
    return { body, paths: null };
  }
  const paths = block[1].split("\n").map((l) => l.replace(/^\s+-\s+/, "").trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  return { body, paths };
}

function listRules(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true }).filter((f) => String(f).endsWith(".md")).map((f) => join(dir, String(f))).sort();
}

const errors = [];
const claudeMd = join(root, "CLAUDE.md");
if (!existsSync(claudeMd)) {
  console.error(`CLAUDE.md não encontrado em '${root}'`);
  process.exit(1);
}

const claudeLines = lineCount(readFileSync(claudeMd, "utf8"));
if (claudeLines > MAX_CLAUDE_MD_LINES) errors.push(`CLAUDE.md tem ${claudeLines} linhas, o teto é ${MAX_CLAUDE_MD_LINES}`);

const fixed = [...collectFixedFiles(claudeMd)];
// AGENTS.md entra no início de toda sessão mesmo quando o CLAUDE.md não o importa.
const agents = join(root, "AGENTS.md");
if (existsSync(agents) && !fixed.some(([f]) => f === agents)) fixed.push(...collectFixedFiles(agents));

const rows = [];
const conditional = [];
for (const file of listRules(join(root, ".claude", "rules"))) {
  const name = relative(root, file);
  try {
    const { body, paths } = parseRule(readFileSync(file, "utf8"), name);
    const text = stripHtmlComments(body);
    if (paths === null) {
      errors.push(`${name}: regra sem 'paths' carrega sempre; declare 'paths' como lista YAML ou mova o conteúdo`);
      rows.push([name, lineCount(text), text.length]);
    } else {
      conditional.push([name, lineCount(text), toTokens(text.length), paths.join(", ")]);
    }
  } catch (e) {
    errors.push(e.message);
  }
}
for (const [file, text] of fixed) rows.push([relative(root, file), lineCount(text), text.length]);

const pad = (v, n) => String(v).padEnd(n);
const num = (n) => n.toLocaleString("pt-BR");
console.log("Custo fixo (carrega em toda sessão)\n");
console.log(`| ${pad("Arquivo", 28)} | Linhas | Tokens |\n| ${"-".repeat(28)} | ------ | ------ |`);
let total = 0;
for (const [file, lines, chars] of rows) {
  const tokens = toTokens(chars);
  total += tokens;
  console.log(`| ${pad(file, 28)} | ${pad(lines, 6)} | ${pad(num(tokens), 6)} |`);
}
console.log(`| ${pad("**Total fixo**", 28)} |        | ${pad(num(total), 6)} |`);
if (conditional.length) {
  console.log("\nRegras com `paths` (carregam sob demanda, fora do custo fixo)\n");
  console.log("| Regra | Linhas | Tokens | paths |\n| ----- | ------ | ------ | ----- |");
  for (const [name, lines, tokens, paths] of conditional) console.log(`| ${name} | ${lines} | ${num(tokens)} | ${paths} |`);
}
if (errors.length) {
  console.error(`\n${errors.map((e) => `ERRO: ${e}`).join("\n")}`);
  process.exit(1);
}
