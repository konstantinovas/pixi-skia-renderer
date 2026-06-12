import { type CanvasKit, type CanvasKitInitOptions } from "../skia/types/index";

declare global {
  interface Window {
    CanvasKitInit: (
      opts?: CanvasKitInitOptions | undefined,
    ) => Promise<CustomCanvasKit>;
  }
}

export {};
