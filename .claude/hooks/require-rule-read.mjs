// Exige a leitura de uma regra de .claude/rules/ antes da primeira escrita num arquivo que casa com ela.
// Por quê: a regra com `paths` só carrega quando o agente LÊ um arquivo que casa; quem cria ou edita
// sem ler antes nunca a recebe (piloto ENG-180: carga de 1/4 e 1/5 sem hook). Este hook nega a
// escrita e diz qual regra ler. Ficam de fora, por decisão do Gabriel, `css`, `icones`, `testes` e
// `next-patch`.
// Estado: um arquivo por sessão e por regra no diretório temporário, marcado quando a regra entra
// no contexto (pela carga automática ou por leitura explícita).
import { existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Regra → arquivos que ela guarda, relativos à raiz do projeto. Espelham os `paths` de cada regra.
const GUARDED_RULES = [
  { rule: ".claude/rules/storybook.md", topic: "story e MDX", matches: /^src\/.*\.(stories\.tsx|mdx)$/ },
  { rule: ".claude/rules/componentes.md", topic: "componentes", matches: /^src\/components\// },
  {
    rule: ".claude/rules/supabase.md",
    topic: "Supabase",
    matches: /^(supabase\/|src\/lib\/supabase\/|app\/(.*\/)?actions[^/]*\.ts$)/,
  },
];

const deny = (reason) =>
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason } }));

const flagFor = (sessionId, rule) =>
  path.join(process.env.RULE_READ_STATE_DIR ?? tmpdir(), `rule-read-${sessionId}-${path.basename(rule, ".md")}`);

// Caminho relativo à raiz, com "/" (o padrão das regras); fora do projeto, começa por "..".
function relativeToProject(target, cwd) {
  const root = process.env.CLAUDE_PROJECT_DIR ?? cwd ?? process.cwd();
  return path.relative(root, path.resolve(root, target)).split(path.sep).join("/");
}

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  const e = JSON.parse(raw || "{}");
  const sessionId = e.session_id ?? "sem-sessao";
  const target = String(e.file_path ?? e.tool_input?.file_path ?? "");

  // A regra entrou no contexto: pela carga automática (InstructionsLoaded) ou por leitura explícita.
  const loaded = GUARDED_RULES.find(({ rule }) => target.endsWith(rule));
  if (loaded && (e.hook_event_name === "InstructionsLoaded" || e.tool_name === "Read")) {
    writeFileSync(flagFor(sessionId, loaded.rule), "1");
    return;
  }
  const isWrite = e.hook_event_name === "PreToolUse" && (e.tool_name === "Write" || e.tool_name === "Edit");
  if (!isWrite || !target) return;

  const relative = relativeToProject(target, e.cwd);
  const unread = GUARDED_RULES.filter(({ rule, matches }) => matches.test(relative) && !existsSync(flagFor(sessionId, rule)));
  if (unread.length === 0) return;
  const rules = unread.map(({ rule, topic }) => `${rule} (regras de ${topic})`).join(" e ");
  deny(`Leia ${rules} antes de escrever em ${relative}. Depois repita a escrita.`);
});
