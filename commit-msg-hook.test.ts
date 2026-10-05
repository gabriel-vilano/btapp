import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

// Fica na raiz porque o project `unit` só inclui src/**, app/** e *.test.ts da raiz.
const HOOK = path.join(__dirname, ".githooks", "commit-msg");
const dirs: string[] = [];

function runHook(message: string) {
  const dir = mkdtempSync(path.join(tmpdir(), "commit-msg-"));
  dirs.push(dir);
  const file = path.join(dir, "COMMIT_EDITMSG");
  writeFileSync(file, message);
  const result = spawnSync("sh", [HOOK, file], { encoding: "utf8" });
  return {
    status: result.status,
    stderr: result.stderr,
    message: readFileSync(file, "utf8"),
  };
}

function subjectWithLength(length: number) {
  const prefix = "feat: ";
  return prefix + "a".repeat(length - prefix.length);
}

afterEach(() => {
  while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true });
});

describe("commit-msg: coautoria", () => {
  it("remove Co-Authored-By em qualquer capitalização e mantém o resto intacto", () => {
    const message = [
      "feat: adicionar hook",
      "",
      "Corpo da mensagem.",
      "",
      "Co-Authored-By: Alguém <a@b.c>",
      "co-authored-by: Outro <d@e.f>",
      "Claude-Session: https://claude.ai/code/session_x",
      "",
    ].join("\n");
    const result = runHook(message);
    expect(result.status).toBe(0);
    expect(result.message).toBe(
      "feat: adicionar hook\n\nCorpo da mensagem.\n\nClaude-Session: https://claude.ai/code/session_x\n",
    );
    expect(result.stderr).toContain("removi a coautoria");
    expect(result.stderr).toContain("Alguém");
  });

  it("não avisa quando não há coautoria", () => {
    const result = runHook("fix: corrigir validação\n");
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });
});

describe("commit-msg: Conventional Commits", () => {
  it.each(["feat: adicionar tela", "fix(auth): corrigir login", "chore!: quebrar contrato"])(
    "aceita '%s'",
    (subject) => {
      expect(runHook(`${subject}\n`).status).toBe(0);
    },
  );

  it("reprova prefixo inválido mostrando o valor recebido e o formato", () => {
    const result = runHook("update: mexer em algo\n");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("'update: mexer em algo'");
    expect(result.stderr).toContain("esperado");
  });

  it("reprova assunto sem prefixo", () => {
    expect(runHook("adicionar tela\n").status).toBe(1);
  });

  it("reprova maiúscula depois do prefixo", () => {
    const result = runHook("feat: Adicionar tela\n");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("maiúscula");
  });

  it("reprova ponto final", () => {
    const result = runHook("feat: adicionar tela.\n");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("ponto final");
  });
});

describe("commit-msg: comprimento", () => {
  it("72 caracteres passa sem aviso", () => {
    const result = runHook(`${subjectWithLength(72)}\n`);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("73 caracteres passa com aviso", () => {
    const result = runHook(`${subjectWithLength(73)}\n`);
    expect(result.status).toBe(0);
    expect(result.stderr).toContain("aviso");
    expect(result.stderr).toContain("73");
  });

  it("100 caracteres passa com aviso", () => {
    expect(runHook(`${subjectWithLength(100)}\n`).status).toBe(0);
  });

  it("101 caracteres reprova", () => {
    const result = runHook(`${subjectWithLength(101)}\n`);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("101");
  });

  it("conta caracteres, não bytes (acentos)", () => {
    const subject = "feat: " + "ç".repeat(94);
    expect(subject.length).toBe(100);
    expect(runHook(`${subject}\n`).status).toBe(0);
  });
});

describe("commit-msg: isenções", () => {
  it.each([
    "Merge branch 'master' into chore/x",
    "Merge pull request #1 from a/b",
    "Merge remote-tracking branch 'origin/master'",
    'Revert "feat: adicionar tela"',
  ])("isenta '%s'", (subject) => {
    expect(runHook(`${subject}\n`).status).toBe(0);
  });

  it("ainda remove coautoria de um commit de merge", () => {
    const result = runHook("Merge branch 'master'\n\nCo-Authored-By: X <x@y.z>\n");
    expect(result.status).toBe(0);
    expect(result.message).not.toContain("Co-Authored-By");
  });
});
