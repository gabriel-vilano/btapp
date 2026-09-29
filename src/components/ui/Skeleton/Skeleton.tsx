import styles from "./Skeleton.module.css";

type SkeletonTextScale = "label-md" | "body-md" | "body-lg" | "title-md";
type SkeletonCircleSize = 32 | 40 | 48 | 96;

type SkeletonShape = "text" | "circle" | "rect";

type SkeletonProps = {
  /** `rect` ocupa a largura do contêiner; a altura vem da custom property `--skeleton-height`. */
  shape: SkeletonShape;
  /** Só `text`: escala tipográfica que o texto real vai usar. A linha ocupa a mesma altura. */
  textScale?: SkeletonTextScale;
  /** Só `text`: quantidade de linhas. A última fica mais curta, como num parágrafo. */
  lines?: number;
  /** Só `circle`: segue os tamanhos do Avatar. */
  size?: SkeletonCircleSize;
  className?: string;
};

/**
 * Forma cinza pulsante que ocupa o lugar do conteúdo enquanto ele carrega.
 * @example <Skeleton shape="text" textScale="body-md" lines={2} />
 */
export function Skeleton(props: SkeletonProps) {
  if (props.shape === "text") {
    return <SkeletonText {...props} />;
  }

  const { shape, size = 40, className } = props;
  const sizeClass = shape === "circle" && styles[`skeleton--circle-${size}`];
  const rootClasses = [styles.skeleton, styles[`skeleton--${shape}`], sizeClass, className]
    .filter(Boolean)
    .join(" ");

  return <span className={rootClasses} aria-hidden="true" />;
}

function SkeletonText({
  textScale = "body-md",
  lines = 1,
  className,
}: SkeletonProps) {
  const lineClasses = [styles.skeleton, styles["skeleton--text"], styles[`skeleton--${textScale}`]].join(" ");
  const rootClasses = [styles.skeleton__lines, className].filter(Boolean).join(" ");

  return (
    <span className={rootClasses} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <span key={index} className={lineClasses} />
      ))}
    </span>
  );
}

export type { SkeletonProps, SkeletonShape, SkeletonTextScale, SkeletonCircleSize };
