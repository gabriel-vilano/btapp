import { describe, expect, it } from "vitest";
import { AVATAR_MAX_DIMENSION, fitWithin } from "./resizeAvatar";

// resizeAvatar usa canvas e createImageBitmap, que só existem no browser: o fluxo
// completo é testado na story LargePhoto do AvatarUpload (npm run test:stories).
describe("fitWithin", () => {
  it("encolhe foto de celular em paisagem pelo lado maior", () => {
    expect(fitWithin({ width: 4032, height: 3024 }, AVATAR_MAX_DIMENSION)).toEqual({ width: 512, height: 384 });
  });

  it("encolhe foto em retrato pelo lado maior", () => {
    expect(fitWithin({ width: 3024, height: 4032 }, AVATAR_MAX_DIMENSION)).toEqual({ width: 384, height: 512 });
  });

  it("não amplia imagem menor que o limite", () => {
    expect(fitWithin({ width: 200, height: 150 }, AVATAR_MAX_DIMENSION)).toEqual({ width: 200, height: 150 });
  });

  it("nunca devolve dimensão zero em panorâmica extrema", () => {
    expect(fitWithin({ width: 10000, height: 5 }, AVATAR_MAX_DIMENSION)).toEqual({ width: 512, height: 1 });
  });
});
