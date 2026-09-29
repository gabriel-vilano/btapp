// O avatar aparece no máximo a 96px (192px em tela 2x); 512px sobra para telas densas
// e para um avatar maior no perfil, e fica muito abaixo do AVATAR_MAX_BYTES.
export const AVATAR_MAX_DIMENSION = 512;

// JPEG em vez de PNG ou WebP: o tamanho fica previsível (~50–150KB a 512px) e o
// Safari antigo não codifica WebP no canvas (devolve PNG sem avisar).
const AVATAR_OUTPUT_TYPE = "image/jpeg";
const AVATAR_OUTPUT_QUALITY = 0.85;

// Fundo para PNG/WebP com transparência: o JPEG não tem canal alfa, e sem fundo
// a área transparente viraria preta.
const AVATAR_BACKGROUND = "#ffffff";

type Dimensions = { width: number; height: number };

/**
 * Encolhe mantendo a proporção até o maior lado caber em `maxDimension`. Nunca amplia.
 * Ex: `fitWithin({ width: 4000, height: 3000 }, 512)` → `{ width: 512, height: 384 }`.
 */
export function fitWithin(source: Dimensions, maxDimension: number): Dimensions {
  const scale = Math.min(1, maxDimension / Math.max(source.width, source.height));
  return {
    width: Math.max(1, Math.round(source.width * scale)),
    height: Math.max(1, Math.round(source.height * scale)),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas.toBlob devolveu null ao gerar o avatar"))),
      AVATAR_OUTPUT_TYPE,
      AVATAR_OUTPUT_QUALITY
    );
  });
}

function drawAvatar(bitmap: ImageBitmap): HTMLCanvasElement {
  const { width, height } = fitWithin(bitmap, AVATAR_MAX_DIMENSION);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D indisponível: não dá para redimensionar o avatar");
  }
  context.fillStyle = AVATAR_BACKGROUND;
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  return canvas;
}

/**
 * Redimensiona a foto escolhida para no máximo 512px e recomprime em JPEG. Só roda no browser.
 * Rejeita quando o browser não consegue decodificar a imagem (arquivo corrompido ou não é imagem).
 * Ex: `const avatar = await resizeAvatar(inputFile)`.
 */
export async function resizeAvatar(file: File): Promise<File> {
  // createImageBitmap aplica a orientação do EXIF: foto de celular em pé não sai deitada.
  const bitmap = await createImageBitmap(file);
  try {
    const blob = await canvasToBlob(drawAvatar(bitmap));
    return new File([blob], "avatar.jpg", { type: AVATAR_OUTPUT_TYPE });
  } finally {
    bitmap.close();
  }
}
