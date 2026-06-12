import * as PIXI from "pixi.js-legacy";

type ShapeLike =
  | PIXI.Rectangle
  | PIXI.Circle
  | PIXI.Ellipse
  | PIXI.Polygon
  | { contains(x: number, y: number): boolean };

export class HitTester {
  hitTest(
    obj: PIXI.DisplayObject,
    point: { x: number; y: number },
  ): PIXI.DisplayObject | null {
    if (!obj.visible || obj.worldAlpha === 0) return null;

    // контейнер — идём вглубь
    if (obj instanceof PIXI.Container) {
      for (let i = obj.children.length - 1; i >= 0; i--) {
        const hit = this.hitTest(obj.children[i], point);
        if (hit) return hit;
      }
    }

    if (!this.isInteractive(obj)) {
      return null;
    }

    // Graphics — точная геометрия
    if (obj instanceof PIXI.Graphics) {
      const local = this.toLocalPoint(obj, point.x, point.y);
      if (this.hitTestGraphics(obj, local.x, local.y)) {
        return obj;
      }
    }

    // Sprite — точная проверка по texture frame
    if (obj instanceof PIXI.Sprite) {
      const local = this.toLocalPoint(obj, point.x, point.y);
      if (this.hitTestSprite(obj, local.x, local.y)) {
        return obj;
      }
    }

    return null;
  }

  private isInteractive(obj: PIXI.DisplayObject): boolean {
    const eventMode = (obj as any).eventMode;

    return eventMode === "static" || eventMode === "dynamic";
  }

  private toLocalPoint(obj: PIXI.DisplayObject, x: number, y: number) {
    return obj.worldTransform.applyInverse({ x, y }, { x: 0, y: 0 });
  }

  private hitTestGraphics(obj: PIXI.Graphics, x: number, y: number): boolean {
    // hitArea имеет приоритет
    const hitArea = obj.hitArea;
    if (hitArea) {
      return this.hitTestShape(hitArea, x, y);
    }

    const dataArray = obj.geometry.graphicsData;
    if (!dataArray) return false;

    for (const data of dataArray) {
      return this.hitTestShape(data.shape, x, y);
    }

    return false;
  }

  private hitTestShape(shape: ShapeLike, x: number, y: number): boolean {
    if (!shape) return false;

    if (shape instanceof PIXI.Rectangle) {
      return (
        x >= shape.x &&
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height
      );
    }

    if (shape instanceof PIXI.Circle) {
      const dx = x - shape.x;
      const dy = y - shape.y;
      return dx * dx + dy * dy <= shape.radius * shape.radius;
    }

    if (shape instanceof PIXI.Ellipse) {
      const rx = shape.width;
      const ry = shape.height;

      const dx = (x - shape.x) / rx;
      const dy = (y - shape.y) / ry;

      return dx * dx + dy * dy <= 1;
    }

    if (shape instanceof PIXI.Polygon) {
      return this.pointInPolygon(x, y, shape.points);
    }

    if (typeof shape.contains === "function") {
      return shape.contains(x, y);
    }

    return false;
  }

  private pointInPolygon(x: number, y: number, points: number[]): boolean {
    let inside = false;

    for (let i = 0, j = points.length - 2; i < points.length; i += 2) {
      const xi = points[i],
        yi = points[i + 1];
      const xj = points[j],
        yj = points[j + 1];

      const intersect =
        yi > y !== yj > y &&
        x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0000001) + xi;

      if (intersect) inside = !inside;

      j = i;
    }

    return inside;
  }

  private hitTestSprite(sprite: PIXI.Sprite, x: number, y: number): boolean {
    const texture = sprite.texture;
    if (!texture?.valid) return false;

    const frame = texture.frame;

    // sprite rect (в локальных координатах)
    const left = -sprite.anchor.x * frame.width;
    const top = -sprite.anchor.y * frame.height;
    const right = left + frame.width;
    const bottom = top + frame.height;

    return x >= left && x <= right && y >= top && y <= bottom;
  }
}
