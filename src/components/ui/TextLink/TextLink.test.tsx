import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import styles from "./TextLink.module.css";
import { TextLink } from "./TextLink";

function classOf(markup: string): string[] {
  const match = markup.match(/class="([^"]*)"/);
  return match ? match[1].split(" ") : [];
}

// Regressão ENG-113: o className do consumidor apagava as classes do link.
describe("TextLink com className extra", () => {
  it("como link, mantém a classe do link e soma a extra", () => {
    const markup = renderToStaticMarkup(
      <TextLink href="/x" className="extra" block>
        Texto
      </TextLink>,
    );
    expect(classOf(markup)).toEqual([
      styles["text-link"],
      styles["text-link--block"],
      "extra",
    ]);
  });

  it("como botão, mantém a classe do link e soma a extra", () => {
    const markup = renderToStaticMarkup(
      <TextLink onClick={() => {}} className="extra">
        Texto
      </TextLink>,
    );
    expect(classOf(markup)).toEqual([styles["text-link"], "extra"]);
  });
});
