import type { SkiaContext } from "./pixiSkiaRenderer";
import * as PIXI from "pixi.js-legacy";
import type { Paint } from "./types";

export class GraphicsRenderer {
  private skia: SkiaContext;
  constructor(skia: SkiaContext) {
    this.skia = skia;
  }

  render(graphics: PIXI.Graphics) {
    const data = graphics.geometry.graphicsData;
    if (!data) return;

    for (const d of data) {
      const shape = d.shape;

      const fill = this.makePaint(d.fillStyle, true);
      const stroke = this.makePaint(d.lineStyle, false);

      if (shape instanceof PIXI.Rectangle) {
        this.drawRect(shape, fill, stroke);
      }
      if (shape instanceof PIXI.Circle) {
        this.drawCircle(shape, fill, stroke);
      }
      if (shape instanceof PIXI.Ellipse) {
        this.drawEllipse(shape, fill, stroke);
      }
      if (shape instanceof PIXI.Polygon) {
        this.drawPolygon(shape, fill, stroke);
      }

      fill?.delete();
      stroke?.delete();
    }
  }

  private drawRect(
    shape: PIXI.Rectangle,
    fill: Paint | null,
    stroke: Paint | null,
  ) {
    const ck = this.skia.ck;
    const rect = ck.XYWHRect(shape.x, shape.y, shape.width, shape.height);

    if (fill) this.skia.canvas.drawRect(rect, fill);
    if (stroke) this.skia.canvas.drawRect(rect, stroke);
  }

  private drawCircle(
    shape: PIXI.Circle,
    fill: Paint | null,
    stroke: Paint | null,
  ) {
    const canvas = this.skia.canvas;

    if (fill) canvas.drawCircle(shape.x, shape.y, shape.radius, fill);
    if (stroke) canvas.drawCircle(shape.x, shape.y, shape.radius, stroke);
  }

  private drawEllipse(
    shape: PIXI.Ellipse,
    fill: Paint | null,
    stroke: Paint | null,
  ) {
    const canvas = this.skia.canvas;
    const ck = this.skia.ck;

    // drawOval ожидает ограничивающий прямоугольник
    const left = shape.x - shape.width;
    const top = shape.y - shape.height;
    const right = shape.x + shape.width;
    const bottom = shape.y + shape.height;
    const ovalRect = ck.XYWHRect(left, top, right - left, bottom - top);

    if (fill) canvas.drawOval(ovalRect, fill);
    if (stroke) canvas.drawOval(ovalRect, stroke);
  }

  private drawPolygon(
    shape: PIXI.Polygon,
    fill: Paint | null,
    stroke: Paint | null,
  ) {
    const ck = this.skia.ck;
    const path = new ck.Path();

    path.moveTo(shape.points[0], shape.points[1]);

    for (let i = 2; i < shape.points.length; i += 2) {
      path.lineTo(shape.points[i], shape.points[i + 1]);
    }

    path.close();

    if (fill) this.skia.canvas.drawPath(path, fill);
    if (stroke) this.skia.canvas.drawPath(path, stroke);

    path.delete();
  }

  private makePaint(style: any, isFill: boolean): Paint | null {
    if (!style) return null;

    const ck = this.skia.ck;
    const paint = new ck.Paint();

    if (isFill) {
      if (!style.visible) return null;

      paint.setStyle(ck.PaintStyle.Fill);
      paint.setColor(this.toColor(style.color, style.alpha));
    } else {
      if (!style.visible || style.width === 0) return null;

      paint.setStyle(ck.PaintStyle.Stroke);
      paint.setStrokeWidth(style.width);
      paint.setColor(this.toColor(style.color, style.alpha));
    }

    return paint;
  }

  private toColor(color: number, alpha: number) {
    const r = ((color >> 16) & 0xff) / 255;
    const g = ((color >> 8) & 0xff) / 255;
    const b = (color & 0xff) / 255;

    return this.skia.ck.Color4f(r, g, b, alpha);
  }
}
