// `form.elements` tipa os itens como `Element`; o que lemos deles (tagName,
// type, disabled, focus) existe nos campos reais e nos falsos do teste.
type FormLike = { elements: ArrayLike<Element> };

type FieldLike = Pick<Element, "tagName"> & {
  type?: string;
  disabled?: boolean;
  focus?: () => void;
};

const TYPES_WITHOUT_TEXT_ENTRY = new Set(["hidden", "button", "submit"]);

function isTextField(el: FieldLike): boolean {
  if (el.disabled) return false;
  if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") return false;
  return !TYPES_WITHOUT_TEXT_ENTRY.has(el.type ?? "");
}

/**
 * Passa o foco ao próximo campo de texto do formulário e devolve se achou.
 * Pula hidden, botões (o toggle de senha) e campos desabilitados.
 * Ex.: `focusNextField(e.currentTarget.form, e.currentTarget)`.
 */
export function focusNextField(
  form: FormLike | null,
  current: Element,
): boolean {
  if (!form) return false;
  const fields = Array.from(form.elements) as FieldLike[];
  const index = fields.indexOf(current as FieldLike);
  const next = fields.slice(index + 1).find(isTextField);
  next?.focus?.();
  return Boolean(next);
}
