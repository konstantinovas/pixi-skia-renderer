import * as PIXI from "pixi.js-legacy";
import { HitTester } from "./hitTester";
import { PdfExporter } from "./pdfExporter";
import type { Canvas, CanvasKit, Surface } from "./types";
import { DisplayObjectRenderer } from "./displayObjectRenderer";

export type SkiaContext = {
  ck: CanvasKit;
  surface: Surface;
  canvas: Canvas;
};

export class PixiSkiaRenderer {
  private htmlCanvas: HTMLCanvasElement;

  private skiaContext?: SkiaContext;

  private root: PIXI.Container | null = null;

  private renderer?: DisplayObjectRenderer;
  private hitTester?: HitTester;
  private pdfExporter?: PdfExporter;

  constructor(htmlCanvas: HTMLCanvasElement) {
    this.htmlCanvas = htmlCanvas;
  }

  async init() {
    let ck = await window.CanvasKitInit({
      locateFile: (f: string) => `${import.meta.env.BASE_URL}canvaskit/${f}`,
    });

    let surface = ck.MakeSWCanvasSurface(this.htmlCanvas)!;
    let canvas = surface.getCanvas();

    if (!ck || !surface || !canvas) {
      throw new Error("Cannot download Skia");
    }

    this.skiaContext = {
      ck,
      surface,
      canvas,
    };

    this.renderer = new DisplayObjectRenderer(this.skiaContext);
    this.hitTester = new HitTester();
    this.pdfExporter = new PdfExporter(
      this.skiaContext,
      this.renderer,
      this.htmlCanvas,
    );

    this.attachEvents();
  }

  private attachEvents() {
    this.htmlCanvas.addEventListener("pointerdown", this.onPointerDown);
    this.htmlCanvas.addEventListener("pointerup", this.onPointerUp);
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.root) return;

    const point = this.toScenePoint(e);
    const target = this.hitTester?.hitTest(this.root, point);

    if (!target) return;
    const fpe = new PIXI.FederatedPointerEvent(new PIXI.EventBoundary(target));

    target?.emit("pointerdown", fpe);
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.root) return;

    const point = this.toScenePoint(e);
    const target = this.hitTester?.hitTest(this.root, point);

    if (!target) return;
    const fpe = new PIXI.FederatedPointerEvent(new PIXI.EventBoundary(target));

    target?.emit("pointerup", fpe);
  };

  private toScenePoint(e: PointerEvent): PIXI.Point {
    const rect = this.htmlCanvas?.getBoundingClientRect();
    return new PIXI.Point(e.clientX - rect.left, e.clientY - rect.top);
  }

  render(root: PIXI.Container) {
    if (!this.skiaContext) return new Error("not skiaContext");

    this.root = root;

    this.skiaContext.canvas.clear(this.skiaContext.ck.WHITE);
    this.renderer?.render(root);

    this.skiaContext.surface.flush();
  }

  downloadPDF(container: PIXI.Container, fileName?: string) {
    return this.pdfExporter?.export(container, fileName);
  }
}
