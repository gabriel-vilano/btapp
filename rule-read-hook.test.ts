import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

// Fica na raiz porque o project `unit` só inclui src/**, app/** e *.test.ts da raiz.
const HOOK = path.join(__dirname, ".claude", "hooks", "require-rule-read.mjs");
const PROJECT = "/projeto";
let stateDir = "";

type HookEvent = { hook_event_name: string; tool_name?: string; file_path?: string; tool_input?: { file_path: string } };

function runHook(event: HookEvent): string {
  const result = spawnSync("node", [HOOK], {
    input: JSON.stringify({ session_id: "teste", cwd: PROJECT, ...event }),
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: PROJECT, RULE_READ_STATE_DIR: stateDir },
  });
  if (result.status !== 0) throw new Error(`Hook saiu com ${result.status}: ${result.stderr}`);
  return result.stdout;
}

const write = (file: string) => runHook({ hook_event_name: "PreToolUse", tool_name: "Write", tool_input: { file_path: `${PROJECT}/${file}` } });
const read = (file: string) => runHook({ hook_event_name: "PreToolUse", tool_name: "Read", tool_input: { file_path: `${PROJECT}/${file}` } });

function denialReason(stdout: string): string | undefined {
  if (!stdout.trim()) return undefined;
  return JSON.parse(stdout).hookSpecificOutput.permissionDecisionReason;
}

beforeEach(() => {
  stateDir = mkdtempSync(path.join(tmpdir(), "rule-read-"));
});

afterEach(() => {
  rmSync(stateDir, { recursive: true, force: true });
});

describe("hook de leitura obrigatória das regras", () => {
  it.each([
    ["src/components/ui/Button/Button.stories.tsx", "storybook.md"],
    ["src/components/ui/Button/Button.mdx", "storybook.md"],
    ["src/components/ui/Button/Button.tsx", "componentes.md"],
    ["supabase/migrations/20261005_feed.sql", "supabase.md"],
    ["src/lib/supabase/server.ts", "supabase.md"],
    ["app/(auth)/entrar/actions.ts", "supabase.md"],
    ["app/actions.ts", "supabase.md"],
  ])("barra a escrita em %s até ler a %s", (file, rule) => {
    expect(denialReason(write(file))).toContain(`.claude/rules/${rule}`);
  });

  it("pede as duas regras de uma vez quando o arquivo casa com as duas", () => {
    const reason = denialReason(write("src/components/ui/Button/Button.stories.tsx"));
    expect(reason).toContain(".claude/rules/storybook.md");
    expect(reason).toContain(".claude/rules/componentes.md");
  });

  it("libera a escrita depois da leitura explícita da regra", () => {
    read(".claude/rules/supabase.md");
    expect(write("supabase/migrations/20261005_feed.sql")).toBe("");
  });

  it("libera a escrita depois da carga automática da regra", () => {
    runHook({ hook_event_name: "InstructionsLoaded", file_path: `${PROJECT}/.claude/rules/componentes.md` });
    expect(write("src/components/ui/Button/Button.tsx")).toBe("");
  });

  it("a leitura de uma regra não libera a outra", () => {
    read(".claude/rules/componentes.md");
    const reason = denialReason(write("src/components/ui/Button/Button.stories.tsx"));
    expect(reason).toContain(".claude/rules/storybook.md");
    expect(reason).not.toContain(".claude/rules/componentes.md");
  });

  it.each(["src/app.css", "app/(app)/feed/page.tsx", "src/lib/brand.ts", "e2e/login.spec.ts", "../outro/src/components/X.tsx"])(
    "não barra %s, que nenhuma regra com hook guarda",
    (file) => {
      expect(write(file)).toBe("");
    },
  );
});
