import * as PIXI from "pixi.js-legacy";
import type { SkiaContext } from "./pixiSkiaRenderer";
import { GraphicsRenderer } from "./graphicsRenderer";
import { SpriteRenderer } from "./spriteRenderer";

export class DisplayObjectRenderer {
  private graphics: GraphicsRenderer;
  private sprite: SpriteRenderer;
  private skia: SkiaContext;

  constructor(skia: SkiaContext) {
    this.skia = skia;
    this.graphics = new GraphicsRenderer(skia);
    this.sprite = new SpriteRenderer(skia);
  }

  render(obj: PIXI.DisplayObject) {
    this.renderNode(obj);
  }

  private renderNode(obj: PIXI.DisplayObject) {
    const canvas = this.skia.canvas;

    canvas.save();
    this.applyTransform(obj);

    if (obj instanceof PIXI.Container) {
      for (const child of obj.children) {
        this.renderNode(child);
      }
    }

    if (obj instanceof PIXI.Graphics) {
      this.graphics.render(obj);
    } else if (obj instanceof PIXI.Sprite) {
      this.sprite.render(obj);
    }

    canvas.restore();
  }

  private applyTransform(obj: PIXI.DisplayObject) {
    const m = obj.transform.localTransform;

    this.skia.canvas.concat([m.a, m.c, m.tx, m.b, m.d, m.ty, 0, 0, 1]);
  }
}
