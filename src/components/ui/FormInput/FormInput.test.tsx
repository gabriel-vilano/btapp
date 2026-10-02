import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { OtpInput } from "@/src/components/auth/OtpInput";
import { FormInput, type FormInputType } from "./FormInput";
import { focusNextField } from "./focusNextField";

function renderField(
  props: { type?: FormInputType; enterKeyHint?: "next" | "done" } = {},
): string {
  return renderToStaticMarkup(
    <FormInput label="Campo" name="campo" value="" onChange={() => {}} {...props} />,
  );
}

describe("FormInput: tecla Enter do teclado virtual", () => {
  it("repassa enterKeyHint ao input", () => {
    expect(renderField({ enterKeyHint: "next" })).toContain('enterKeyHint="next"');
    expect(renderField({ enterKeyHint: "done" })).toContain('enterKeyHint="done"');
  });

  it("sem a prop, não escreve o atributo", () => {
    expect(renderField()).not.toContain("enterKeyHint");
  });

  it("na busca, o padrão é 'search'; a prop vence o padrão", () => {
    expect(renderField({ type: "search" })).toContain('enterKeyHint="search"');
    expect(renderField({ type: "search", enterKeyHint: "done" })).toContain('enterKeyHint="done"');
  });
});

describe("OtpInput: tecla Enter do teclado virtual", () => {
  it("usa 'done', porque o código é o último e único campo", () => {
    const html = renderToStaticMarkup(<OtpInput value="" onChange={() => {}} />);
    expect(html).toContain('enterKeyHint="done"');
  });
});

// Falso mínimo: o unit roda em node, sem DOM. O cast diz ao TS que serve de Element.
function field(tagName: string, extra: { type?: string; disabled?: boolean } = {}) {
  return { tagName, focus: vi.fn(), ...extra } as unknown as Element & {
    focus: ReturnType<typeof vi.fn>;
  };
}

describe("focusNextField", () => {
  it("foca o próximo campo de texto, pulando hidden, botão e desabilitado", () => {
    const current = field("INPUT", { type: "password" });
    const toggle = field("BUTTON", { type: "button" });
    const hidden = field("INPUT", { type: "hidden" });
    const off = field("INPUT", { type: "text", disabled: true });
    const next = field("INPUT", { type: "password" });
    const form = { elements: [current, toggle, hidden, off, next] };

    expect(focusNextField(form, current)).toBe(true);
    expect(next.focus).toHaveBeenCalledOnce();
    expect(toggle.focus).not.toHaveBeenCalled();
  });

  it("no último campo, não faz nada e avisa que não achou", () => {
    const last = field("INPUT", { type: "text" });
    expect(focusNextField({ elements: [last] }, last)).toBe(false);
  });

  it("sem formulário, devolve false", () => {
    expect(focusNextField(null, field("INPUT"))).toBe(false);
  });
});
