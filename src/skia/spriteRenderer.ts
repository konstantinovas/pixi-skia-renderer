import type { SkiaContext } from "./pixiSkiaRenderer";
import * as PIXI from "pixi.js";
import type { Paint } from "./types";

export class SpriteRenderer {
  private skia: SkiaContext;
  private cache = new Map<ImageBitmap, any>();
  private paint: Paint;

  constructor(skia: SkiaContext) {
    this.skia = skia;
    this.paint = new skia.ck.Paint();
  }

  render(sprite: PIXI.Sprite) {
    const texture = sprite.texture;
    if (!texture.valid) return;

    const resource = texture.baseTexture.resource;

    if (
      resource &&
      "source" in resource &&
      resource.source instanceof ImageBitmap
    ) {
      const source = resource.source;

      if (!(source instanceof ImageBitmap)) return;

      let image = this.cache.get(source);

      if (!image) {
        image = this.skia.ck.MakeImageFromCanvasImageSource(source);
        if (!image) return;

        this.cache.set(source, image);
      }

      const frame = texture.frame;

      const src = this.skia.ck.XYWHRect(
        frame.x,
        frame.y,
        frame.width,
        frame.height,
      );
      const dst = this.skia.ck.XYWHRect(
        -sprite.anchor.x * frame.width,
        -sprite.anchor.y * frame.height,
        frame.width,
        frame.height,
      );

      this.skia.canvas.drawImageRect(image, src, dst, this.paint);
    }
  }
}
