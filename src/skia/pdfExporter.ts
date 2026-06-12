import * as PIXI from "pixi.js-legacy";
import type { SkiaContext } from "./pixiSkiaRenderer";
import type { DisplayObjectRenderer } from "./displayObjectRenderer";

export class PdfExporter {
  private skia: SkiaContext;
  private renderer: DisplayObjectRenderer;
  private htmlCanvas: HTMLCanvasElement;
  constructor(
    skia: SkiaContext,
    renderer: DisplayObjectRenderer,
    htmlCanvas: HTMLCanvasElement,
  ) {
    this.skia = skia;
    this.renderer = renderer;
    this.htmlCanvas = htmlCanvas;
  }

  export(container: PIXI.Container, fileName = "scene.pdf") {
    const rootTag = {
      id: 1,
      type: "Document",
      children: [],
    };

    const metadata = {
      title: fileName,
      rootTag: rootTag,
    };
    const pdf = this.skia.ck.MakePDFDocument(metadata);
    const page = pdf.beginPage(this.htmlCanvas.width, this.htmlCanvas.height);

    const prev = this.skia.canvas;
    this.skia.canvas = page;

    this.renderer.render(container);

    pdf.endPage();
    const bytes = pdf.close();

    this.download(bytes, fileName);

    this.skia.canvas = prev;
    pdf.delete();
  }

  private download(data: any, fileName: string) {
    const blob = new Blob([data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
  }
}
