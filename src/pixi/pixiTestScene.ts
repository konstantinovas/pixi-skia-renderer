import * as PIXI from "pixi.js-legacy";

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const randomInt = (min: number, max: number) => Math.floor(random(min, max));

const randomColor = () => Math.floor(Math.random() * 0xffffff);

export const createRandomSceneElement = async () => {
  const type = randomInt(0, 5);

  // ELLIPSE
  if (type === 0) {
    const g = new PIXI.Graphics();

    g.beginFill(randomColor())
      .drawEllipse(0, 0, random(30, 120), random(20, 80))
      .endFill();

    g.position.set(random(0, 800), random(0, 600));
    g.angle = random(-180, 180);

    g.eventMode = "static";

    g.on("pointerdown", () => {
      console.log("ellipse pointerdown");
    });

    return g;
  }

  // RECT
  if (type === 1) {
    const g = new PIXI.Graphics();

    g.beginFill(randomColor())
      .drawRect(0, 0, random(50, 200), random(50, 200))
      .endFill();

    g.position.set(random(0, 800), random(0, 600));
    g.angle = random(-180, 180);

    const scale = random(0.5, 2);

    g.scale.set(scale);

    g.eventMode = "static";

    g.on("pointerup", () => {
      console.log("rect pointerup");
    });

    return g;
  }

  // LINE
  if (type === 2) {
    const g = new PIXI.Graphics();

    const x2 = random(-200, 200);
    const y2 = random(-200, 200);

    const thickness = random(2, 15);

    g.lineStyle(thickness, randomColor(), 1);

    g.moveTo(0, 0).lineTo(x2, y2);

    g.position.set(random(0, 800), random(0, 600));
    g.angle = random(-180, 180);

    // HIT AREA
    const dx = x2;
    const dy = y2;

    const len = Math.sqrt(dx * dx + dy * dy);

    if (len > 0) {
      const halfThickness = thickness / 2;

      // нормаль к линии
      const nx = -dy / len;
      const ny = dx / len;

      g.hitArea = new PIXI.Polygon([
        0 + nx * halfThickness,
        0 + ny * halfThickness,

        x2 + nx * halfThickness,
        y2 + ny * halfThickness,

        x2 - nx * halfThickness,
        y2 - ny * halfThickness,

        0 - nx * halfThickness,
        0 - ny * halfThickness,
      ]);
    }

    g.eventMode = "static";

    g.on("pointerup", () => {
      console.log("line pointerup");
    });

    return g;
  }

  // POLYGON
  if (type === 3) {
    const g = new PIXI.Graphics();

    const points: number[] = [];

    const sides = randomInt(3, 9); // треугольник -> восьмиугольник
    const radius = random(30, 120);

    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides;
      const r = random(radius * 0.5, radius);

      points.push(Math.cos(angle) * r, Math.sin(angle) * r);
    }

    g.beginFill(randomColor()).drawPolygon(points).endFill();

    g.position.set(random(0, 800), random(0, 600));
    g.angle = random(-180, 180);

    const scale = random(0.5, 2);

    g.scale.set(scale);

    g.eventMode = "static";

    g.on("pointerup", () => {
      console.log("polygon pointerup");
    });

    return g;
  }

  // SPRITE
  try {
    const texture = await PIXI.Assets.load(
      `${import.meta.env.BASE_URL}assets/${randomInt(1, 9)}.png`,
    );

    const sprite = new PIXI.Sprite(texture);

    sprite.position.set(random(0, 800), random(0, 600));

    sprite.angle = random(-180, 180);

    const scale = random(0.03, 0.2);

    sprite.scale.set(scale);

    sprite.anchor.set(0.5);

    sprite.eventMode = "static";

    sprite.on("pointerup", () => {
      console.log("sprite pointerup");
    });

    return sprite;
  } catch {
    return null;
  }
};

export const createTestScene = async () => {
  const mainContainer = new PIXI.Container();
  const subContainer = new PIXI.Container();
  const g1 = new PIXI.Graphics();
  const g2 = new PIXI.Graphics();
  const g3 = new PIXI.Graphics();
  const g4 = new PIXI.Graphics();

  g1.beginFill("#ff0000").drawEllipse(0, 0, 200, 100).endFill();
  g1.position.set(200, 100);
  g1.angle = 30;
  g1.eventMode = "static";
  g1.on("pointerdown", () => {
    console.log("g1 pointerdown!");
  });

  g2.beginFill("#0000ff").drawRect(0, 0, 100, 150).endFill();
  g2.position.set(120, 60);
  g2.angle = 15;
  g2.scale.set(1.5, 1.7);
  g2.eventMode = "static";
  g2.on("pointerup", () => {
    console.log("g2 pointerup!");
  });

  g3.lineStyle(10, "#ffffff", 1).moveTo(0, 0).lineTo(150, 100);
  g3.angle = -20;

  g4.lineStyle(10, "#ffff00", 1).moveTo(0, 70).lineTo(150, -30);
  g4.angle = 20;

  subContainer.position.set(75, 50);
  subContainer.addChild(g3, g4);
  mainContainer.addChild(g1, g2, subContainer);

  const texture = await PIXI.Assets.load(
    `${import.meta.env.BASE_URL}assets/1.png`,
  );
  const sprite = new PIXI.Sprite(texture);
  sprite.position.set(100, 50);

  mainContainer.addChild(sprite);

  return mainContainer;
};
