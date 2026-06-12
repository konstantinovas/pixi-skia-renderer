import { createPixiApp } from "./pixi/pixiApp";
import {
  createRandomSceneElement,
  createTestScene,
} from "./pixi/pixiTestScene";
import { PixiSkiaRenderer } from "./skia/pixiSkiaRenderer";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root not found");
}

app.innerHTML = `
  <div class="layout">
    <header class="toolbar">
      <button id="generate-btn">
        Generate Shape
      </button>

      <button id="export-btn">
        Export PDF
      </button>
    </header>

    <main class="canvases">
      <section class="canvas-section">
        <h2>PIXI Canvas</h2>

        <div class="canvas-wrapper">
          <div id="pixi-canvas"></div>
        </div>
      </section>

      <section class="canvas-section">
        <h2>Skia Canvas</h2>

        <div class="canvas-wrapper">
          <canvas id="skia-canvas"></canvas>
        </div>
      </section>
    </main>
  </div>
`;

const generateBtn = document.querySelector<HTMLButtonElement>("#generate-btn");

const exportBtn = document.querySelector<HTMLButtonElement>("#export-btn");

const init = async () => {
  const scene = await createTestScene();

  const pixiCanvas = document.querySelector<HTMLElement>("#pixi-canvas");
  const skiaCanvas = document.querySelector<HTMLCanvasElement>("#skia-canvas");

  if (skiaCanvas?.parentElement) {
    const resizeCanvas = () => {
      const { width, height } =
        skiaCanvas.parentElement!.getBoundingClientRect();

      skiaCanvas.width = width;
      skiaCanvas.height = height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  if (!pixiCanvas || !skiaCanvas) {
    throw new Error("Mount node not found");
  }

  const pixiApp = await createPixiApp({
    mountNode: pixiCanvas,
  });

  pixiApp.stage.addChild(scene);

  const pixiSkiaApp = new PixiSkiaRenderer(skiaCanvas);
  await pixiSkiaApp.init();
  function skiaUpdate() {
    pixiSkiaApp.render(scene);
    requestAnimationFrame(skiaUpdate);
  }
  skiaUpdate();

  exportBtn?.addEventListener("click", () => {
    pixiSkiaApp.downloadPDF(scene);
  });

  generateBtn?.addEventListener("click", async () => {
    const randomSceneElement = await createRandomSceneElement();
    randomSceneElement && scene.addChild(randomSceneElement);
  });
};

init();
