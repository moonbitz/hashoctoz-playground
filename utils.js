function calculateCanvasSize() {
  let w, h;
  if (windowWidth > windowHeight) {
    factor = Math.floor((windowHeight / origHeight) * 1);
    h = origHeight * factor;
    w = h * (origWidth / origHeight);
    // scaleFactor = hFactor;
  } else {
    factor = Math.floor((windowWidth / origWidth) * 1);
    w = origWidth * factor;
    h = w * (origHeight / origWidth);
    // scalefactor = wFactor;
  }

  w = Math.max(w, origWidth);
  h = Math.max(h, origHeight);

  return { w, h };
}

function rectify(img, scaleFactor) {
  const pg = createGraphics(img.width * scaleFactor, img.height * scaleFactor);
  pg.noStroke();
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      pg.fill(img.get(x, y));
      pg.rect(x * scaleFactor, y * scaleFactor, scaleFactor, scaleFactor);
    }
  }
  return pg;
}

function scaleUpAll(arrayOfGraphics, scaleFactor) {
  const pg = createGraphics(origWidth * scaleFactor, origHeight * scaleFactor);
  pg.colorMode(RGB);
  pg.noStroke();
  for (let j = 0; j < arrayOfGraphics.length; j++) {
    arrayOfGraphics[j].loadPixels();
    const sourcePixels = arrayOfGraphics[j].pixels;
    for (let i = 0; i < sourcePixels.length; i += 4) {
      const r = sourcePixels[i];
      const g = sourcePixels[i + 1];
      const b = sourcePixels[i + 2];
      const a = sourcePixels[i + 3];
      const x = (i / 4) % arrayOfGraphics[j].width;
      const y = Math.floor(i / 4 / arrayOfGraphics[j].width);
      pg.fill(r, g, b, a);
      pg.rect(x * scaleFactor, y * scaleFactor, scaleFactor, scaleFactor);
    }
  }
  return pg;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function addFog(pg, scale = 1, speed = 1) {
  pg.clear();
  pg.background(
    160 + Math.sin(frameCount / 80) * 90,
    180 + Math.sin(frameCount / 60) * 80,
    200 + Math.sin(frameCount / 50) * 50
  );
  pg.loadPixels();
  for (let y = 0; y < pg.height; y++) {
    for (let x = 0; x < pg.width; x++) {
      const idx = 4 * y * pg.width + x * 4;
      pg.pixels[idx + 3] =
        noise(x * scale + speed, y * scale + speed, frameCount * 0.01) * 255;
    }
  }
  pg.updatePixels();
  return pg;
}

function addRipple(srcImg, num) {
  // pg.background(0);
  srcImg.clear();

  const center = { x: 100, y: 93 };
  for (let i = 0; i < num; i++) {
    const x = Math.floor(center.x + Math.cos(i) * random(70)) + 0.5;
    const y = Math.floor(center.y + Math.sin(i) * random(20)) + 0.5;
    srcImg.stroke(50, random(40, 170), 240, 80);
    srcImg.line(x, y, x + random(8), y);
  }
  return srcImg;
}
