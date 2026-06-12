import { Application } from "pixi.js-legacy";

export interface CreatePixiAppOptions {
  mountNode: HTMLElement;
}

export const createPixiApp = async (options: CreatePixiAppOptions) => {
  const width = options.mountNode.clientWidth;
  const height = options.mountNode.clientHeight;

  const app = new Application({
    width,
    height,
    backgroundColor: 0xffffff,
    resizeTo: options.mountNode,
    forceCanvas: true,
  });

  const canvas = app.view as HTMLCanvasElement;

  options.mountNode.innerHTML = "";
  options.mountNode.appendChild(canvas);

  return app;
};
