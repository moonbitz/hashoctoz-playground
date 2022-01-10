/**
 * HashOctoz Playground by Moonbitz
 *
 * https://www.fxhash.xyz/generative/5164
 * https://twitter.com/moonbitzzz
 *
 * http://api.fxhash.xyz/graphiql
 * https://graphql.org/graphql-js/graphql-clients/
 * https://www.fxhash.xyz/articles/integration-guide
 *
 * TODO:
 * - rely on generationHash, not metadata attribute values (API may change)
 * - connect fxhash json and loadImage() and load only the necessary images
 *
 * NOTES:
 * - right now preload() has two concurrent operations (api & loadImage)
 */

const bodyNums = 10;
const extraNums = 6;
const eyesNums = 24;
const hairNums = 17;
const mouthNums = 18;

const bodyImgs = [];
const bodyFillImgs = [];

let dataIsLoaded = false;

let scaleFactor = 1;
let factor = 1; // used for resizing canvas

let octoz = [];
let numOctoz = 10;
let octoInitialized = false;
let activeOcto = null;

let displayDialogue = false;

let positions = [
  [50, 34],
  [134, 46],
  [164, 56],
  [60, 74],
  [96, 72],
  [132, 78],
  [40, 92],
  [80, 96],
  [114, 98],
  [160, 92],
];

let saveImage = false;

let collectionData = [];

const imageData = {
  body: [],
  bodyFill: [],
  eyes: [],
  mouth: [],
  hair: [],
  extra: [],
};

let pg;

let bgImg; // background
let fgImg; // foreground
let starsImg; // bg stars
let extraStarsImg; // generative stars
let skyImg; // sky bg
let rippleImg; // update at interval
let steamImg;
let fogImg;

const origWidth = 200;
const origHeight = 150;

function preload() {
  fetch("https://api.fxhash.xyz/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `{
        generativeToken(id: 5164) {
          entireCollection {
            createdAt
            iteration
            metadata
            owner {
              id
              name
            }
            rarity
            generationHash
          }
        }
      }
      `,
    }),
  })
    .then((r) => {
      return r.json();
    })
    .then((r) => {
      collectionData = r.data.generativeToken.entireCollection;

      const len = collectionData.length;
      // collectionData = collectionData.slice(len - 10, len);
      collectionData = shuffle(collectionData);
      dataIsLoaded = true;
      // console.log("collectionData:", collectionData);
      console.log(`
============================================================
HashOctoz Playground by Moonbitz

Mint your own HashOctoz NFT at https://www.fxhash.xyz/generative/5164
Check out our twitter at https://twitter.com/moonbitzzz
============================================================
      `);
    });

  // TODO:
  // ideally code below should run after JSON has been loaded.
  // had problem with async operation, so doing it manually for now.
  // Object.keys(imageData).length
  for (const [key, _] of Object.entries(imageData)) {
    if (key === "body") {
      for (let i = 0; i < bodyNums; i++) {
        imageData[key].push(loadImage(`./public/${key}/${nf(i + 1, 2)}.png`));
        imageData["bodyFill"].push(
          loadImage(`./public/body-fill/${nf(i + 1, 2)}.png`)
        );
      }
    } else if (key === "eyes") {
      for (let i = 0; i < eyesNums; i++) {
        imageData[key].push(loadImage(`./public/${key}/${nf(i + 1, 2)}.png`));
      }
    } else if (key === "mouth") {
      for (let i = 0; i < mouthNums; i++) {
        imageData[key].push(loadImage(`./public/${key}/${nf(i + 1, 2)}.png`));
      }
    } else if (key === "hair") {
      for (let i = 0; i < hairNums; i++) {
        imageData[key].push(loadImage(`./public/${key}/${nf(i + 1, 2)}.png`));
      }
    } else if (key === "extra") {
      for (let i = 0; i < extraNums; i++) {
        imageData[key].push(loadImage(`./public/${key}/${nf(i + 1, 2)}.png`));
      }
    }
  }

  // images
  bgImg = loadImage(`./public/bg/bg.png`);
  fgImg = loadImage(`./public/bg/fg.png`);
  starsImg = loadImage(`./public/bg/stars.png`);
  extraStarsImg = createGraphics(origWidth, origHeight);
  skyImg = loadImage(`./public/bg/sky.png`);
  rippleImg = createGraphics(origWidth, origHeight);
  addRipple(rippleImg, 260);
  steamImg = loadImage(`./public/bg/steam.png`);
  fogImg = createGraphics(origWidth, origHeight);
}

function setup() {
  const dim = calculateCanvasSize();
  const canvas = createCanvas(dim.w, dim.h);

  pixelDensity(1);
  noSmooth();

  pg = createGraphics(origWidth * scaleFactor, origHeight * scaleFactor);
  pg.pixelDensity(1);
  // pg.colorMode(HSB, 360, 100, 100, 100);
  pg.textFont("PressStart2P");
  pg.textSize(8);
}

function windowResized() {
  const dim = calculateCanvasSize();
  const canvas = resizeCanvas(dim.w, dim.h);
}

function makeSureReady() {
  if (!dataIsLoaded) return;
  if (dataIsLoaded && !octoInitialized) {
    let numCounter = 0;
    for (let i = 0; i < collectionData.length; i++) {
      if (
        collectionData[i].metadata &&
        collectionData[i].metadata.attributes &&
        numCounter < numOctoz
      ) {
        const octo = new Octo(collectionData[i]);
        octo.setAttributes(collectionData[i].metadata.attributes);
        const x = positions[numCounter][0] + Math.floor(random(-1, 1));
        const y = positions[numCounter][1] + Math.floor(random(-4, 4));
        octo.setPosition(x, y);
        octo.direction = random(1) < 0.5 ? -1 : 1;
        octo.createOctoGraphics();
        octo.createOctoImage();

        octoz.push(octo);

        numCounter++;
      }
    }
    // bgImgScaled = rectify(bgImg, scaleFactor);
    octoInitialized = true;
  }
}

let x = Math.floor(origWidth / 2);
let y = Math.floor(origHeight / 2);

function draw() {
  background(0, 0, 0);
  fill(255);
  textFont("PressStart2P");
  textSize(width * 0.05);
  textAlign(CENTER);
  text("loading", width / 2, height / 2);

  cursor(ARROW);

  makeSureReady();
  if (!octoInitialized) return;

  pg.background(0, 0, 0);
  pg.image(skyImg, 0, 0);

  // pg.blendMode(SCREEN);
  pg.image(starsImg, 0, 0);

  pg.blendMode(BLEND);
  pg.image(bgImg, 0, 0);

  if (frameCount % 30 === 0) {
    addRipple(rippleImg, 260);
  }
  pg.blendMode(SCREEN);
  pg.image(rippleImg, 0, 0);

  pg.blendMode(BLEND);

  // reset all hover state
  for (let i = 0; i < octoz.length; i++) {
    const octo = octoz[i];
    octo.hover = false;
  }
  // which one is currently hovered?
  for (let i = octoz.length - 1; i >= 0; i--) {
    const octo = octoz[i];
    if (octo.isHovered(mouseX / factor, mouseY / factor)) {
      cursor(HAND);
      octo.hover = true;
      break;
    }
  }

  for (let i = 0; i < octoz.length; i++) {
    const octo = octoz[i];
    octo.display(pg);
  }

  addFog(fogImg, 0.01, frameCount / 100);
  pg.blendMode(SCREEN);
  pg.image(fogImg, 0, 0);

  pg.blendMode(ADD);
  const sy1 = ((frameCount / 10) % 30) * -1;
  pg.tint(255, 50 * Math.sin((-sy1 / 30) * Math.PI));
  pg.image(steamImg, 0, sy1);

  const sy2 = ((frameCount / 20) % 20) * -1;
  pg.tint(255, 30 * Math.sin((-sy2 / 20) * Math.PI));
  pg.image(steamImg, -20, sy2 + 20);

  pg.tint(180, 255);
  pg.blendMode(BLEND);
  pg.image(fgImg, 0, 0);

  // const pgScaled = rectify(pg, scaleFactor);
  // image(pgScaled, 0, 0, width, height);
  pg.tint(255, 255);
  image(pg, 0, 0, width, height);

  if (displayDialogue) {
    activeOcto.displayDialogue(pg);
  }

  if (saveImage) {
    const img = scaleUpAll([pg], 8);
    img.save(`HashOctoz-Playground.png`);
    saveImage = false;
  }
}

function mousePressed() {
  for (let i = octoz.length - 1; i >= 0; i--) {
    const octo = octoz[i];
    if (octo.isHovered(mouseX / factor, mouseY / factor)) {
      cursor(HAND);
      octo.hover = true;
      activeOcto = octo;
      break;
    }
  }

  if (activeOcto && activeOcto.hover === true) {
    displayDialogue = true;
    activeOcto.randomizeDialogueIndex();
  } else {
    displayDialogue = false;
    activeOcto = null;
  }
}

function keyTyped() {
  if (key === "s") {
    saveImage = true;
  }
}
