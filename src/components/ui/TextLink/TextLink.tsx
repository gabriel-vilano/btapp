import Link, { type LinkProps } from "next/link";
import { type ComponentProps, type ReactNode } from "react";
import styles from "./TextLink.module.css";

type TextLinkBaseProps = {
  children: ReactNode;
  className?: string;
  block?: boolean;
};

type TextLinkAsLinkProps = TextLinkBaseProps & {
  href: LinkProps["href"];
  onClick?: never;
} & Omit<ComponentProps<"a">, "href" | "children" | "className">;

type TextLinkAsButtonProps = TextLinkBaseProps & {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit";
} & Omit<ComponentProps<"button">, "onClick" | "children" | "className" | "type">;

type TextLinkProps = TextLinkAsLinkProps | TextLinkAsButtonProps;

// `className` e `children` saem do `rest`: espalhado depois de `className={classNames}`,
// o `className` cru do consumidor apagava as classes do link (ENG-113).
export function TextLink(props: TextLinkProps) {
  const { children, className, block } = props;

  const classNames = [
    styles["text-link"],
    block && styles["text-link--block"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if ("href" in props && props.href !== undefined) {
    const {
      href,
      onClick: _onClick,
      block: _block,
      className: _className,
      children: _children,
      ...rest
    } = props;
    void [_onClick, _block, _className, _children];
    return (
      <Link href={href} className={classNames} {...rest}>
        {children}
      </Link>
    );
  }

  const {
    onClick,
    type = "button",
    href: _href,
    block: _block,
    className: _className,
    children: _children,
    ...rest
  } = props;
  void [_href, _block, _className, _children];
  return (
    <button type={type} onClick={onClick} className={classNames} {...rest}>
      {children}
    </button>
  );
}
