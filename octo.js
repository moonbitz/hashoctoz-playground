class Octo {
  constructor(tokenData) {
    this.tokenData = tokenData;
    this.hash = tokenData.generationHash;
    this.owner = tokenData.owner;
    this.name = tokenData.metadata.name;
    this.rarity = tokenData.rarity;
    this.createdAt = tokenData.createdAt;
    this.thumb = tokenData.metadata.thumbnailUri;

    this.origWidth = 36;
    this.origHeight = 36;
    this.width = this.origWidth;
    this.height = this.origHeight;
    this.x = 0;
    this.y = 0;
    this.direction = 1;

    this.setupDialogues();
  }

  flipDirection() {
    this.direction *= -1;
    setTimeout(this.flipDirection.bind(this), random(4000, 8000));
  }

  setAttributes(attr) {
    this.attributes = attr;
    this.setImages();
  }

  setupDialogues() {
    this.dialogues = [
      this.owner.name !== null
        ? `My owner is ${this.owner.name}.`
        : `Does my owner have a name?`,
      this.rarity !== null
        ? `I am ${Math.floor(this.rarity * 100)}% rare, so they say.`
        : `Wait, I don't know my rarity?`,
      `My name is ${this.name}.`,
      `I was created by Moonbitz.`,
      `Check out twitter @moonbitzzz.`,
      `I love hot springs.`,
      `I am a generative NFT.`,
      `Mint your own HashOctoz at www.fxhash.xyz`,
      `We are HashOctoz!`,
      `We live on the Tezos blockchain.`,
      `There will be 500 unique HashOctoz when fully minted.`,
      `I was created on ${new Date(this.createdAt).toLocaleDateString()}.`,
    ];
  }

  randomizeDialogueIndex() {
    this.dialogueIndex = Math.floor(random(this.dialogues.length));
  }

  setImages() {
    let idx;
    idx = this.attributes.findIndex((item) => item.name == "body");
    this.bodyFill = imageData["bodyFill"][this.attributes[idx].value - 1];
    this.body = imageData["body"][this.attributes[idx].value - 1];
    idx = this.attributes.findIndex((item) => item.name == "eyes");
    this.eyes = imageData["eyes"][this.attributes[idx].value - 1];
    idx = this.attributes.findIndex((item) => item.name == "mouth");
    this.mouth = imageData["mouth"][this.attributes[idx].value - 1];
    idx = this.attributes.findIndex((item) => item.name == "hair");
    this.hair = imageData["hair"][this.attributes[idx].value - 1];
    idx = this.attributes.findIndex((item) => item.name == "extra");
    this.extra = imageData["extra"][this.attributes[idx].value - 1];
  }

  createOctoGraphics() {
    const pg = createGraphics(this.origWidth, this.origHeight);
    pg.pixelDensity(1);
    pg.image(this.bodyFill, 0, 0);
    pg.image(this.body, 0, 0);
    pg.image(this.eyes, 0, 0);
    pg.image(this.mouth, 0, 0);
    if (this.hair) pg.image(this.hair, 0, 0);
    if (this.extra) pg.image(this.extra, 0, 0);
    this.pg = pg;
  }

  createOctoImage() {
    const img = createImage(this.pg.width, this.pg.height);
    img.copy(
      this.pg,
      0,
      0,
      this.pg.width,
      this.pg.height,
      0,
      0,
      img.width,
      img.height
    );
    this.img = img;

    // create mask
    let startY = this.pg.height;
    if (this.y > 90) {
      // bottom row
      startY = 24;
    } else if (this.y > 65) {
      // middle row
      startY = 25;
    }
    this.maskImg = this.generateMaskImg(startY);
    // apply mask
    this.img.mask(this.maskImg);
  }

  generateMaskImg(startY) {
    const y = startY + Math.floor(random(-2, 2));
    const pg = createGraphics(36, 36);
    pg.pixelDensity(1);
    pg.fill(255);
    pg.rect(0, 0, pg.width, y);
    pg.fill(0, 0, 200, 40);
    pg.rect(0, y, pg.width, pg.height);
    return pg;
  }

  isHovered(mx, my) {
    if (
      mx > this.x - this.width / 2 &&
      mx < this.x + this.width / 2 &&
      my > this.y - this.height / 2 &&
      my < this.y + this.height / 2
    ) {
      return true;
      // this.hover = true;
    }
    return false;
    // this.hover = false;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  displayDialogue(pg) {
    push();
    // translate(this.x * factor, this.y * factor);
    translate(0, height * 0.8);
    // flat black rect
    fill(0);
    rect(0, height * 0.1, width, height * 0.1);
    // thumb
    image(this.img, width * 0.01, 0, width * 0.2, width * 0.2);

    // bubble group
    push();
    translate(width * 0.2, height * -0.01);
    // bubble
    fill(255);
    noStroke();
    rect(0, 0, width * 0.75, height * 0.18, width * 0.01);
    beginShape();
    vertex(-width * 0.02, height * 0.15);
    vertex(0, height * 0.12);
    vertex(0, height * 0.14);
    endShape();
    // text
    fill(0);
    textSize(height * 0.04);
    textAlign(LEFT);
    text(
      this.dialogues[this.dialogueIndex],
      width * 0.01,
      height * 0.008,
      width * 0.75,
      height * 0.2
    );
    pop();
    pop();
  }

  display(pg) {
    pg.push();
    if (this.hover === true) {
      pg.tint(200, 255, 100);
    }
    pg.translate(this.x, this.y);
    pg.scale(this.direction, 1);
    pg.imageMode(CENTER);
    pg.image(this.img, 0, 0);
    pg.pop();
  }
}
