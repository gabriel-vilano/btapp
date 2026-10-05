// Exige a leitura de .claude/rules/storybook.md antes da primeira escrita em story ou MDX.
// Por quê: a regra com `paths` só carrega quando o agente LÊ um arquivo que casa; quem cria ou edita
// sem ler antes (S2 e S3 do piloto ENG-180) nunca a recebe. Este hook nega a escrita e pede a leitura.
// Estado: um arquivo em /tmp por sessão, marcado quando a regra entra no contexto.
import { existsSync, writeFileSync } from "node:fs";

const RULE_FILE = ".claude/rules/storybook.md";
const GUARDED_FILE = /\.(stories\.tsx|mdx)$/;

const deny = (reason) =>
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason } }));

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  const e = JSON.parse(raw || "{}");
  const flag = `/tmp/storybook-rule-read-${e.session_id ?? "sem-sessao"}`;
  const target = String(e.file_path ?? e.tool_input?.file_path ?? "");
  const touchesRule = target.endsWith(RULE_FILE);

  // A regra entrou no contexto: pela carga automática (InstructionsLoaded) ou por leitura explícita.
  if (touchesRule && (e.hook_event_name === "InstructionsLoaded" || e.tool_name === "Read")) {
    writeFileSync(flag, "1");
    return;
  }
  const isWrite = e.hook_event_name === "PreToolUse" && (e.tool_name === "Write" || e.tool_name === "Edit");
  if (!isWrite || !GUARDED_FILE.test(target) || existsSync(flag)) return;
  deny(`Leia ${RULE_FILE} antes de escrever em ${target.split("/").slice(-2).join("/")}: ela traz as regras de story e MDX deste projeto. Depois repita a escrita.`);
});
