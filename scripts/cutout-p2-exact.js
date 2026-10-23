const fs = require('fs');
const { PNG } = require('pngjs');

const srcPath = 'C:/Users/ACER/.gemini/antigravity/brain/4483d686-847f-4584-b4e1-d2a111f3cca3/.user_uploaded/media_1792779881968_10287e76.png';
const srcBuf = fs.readFileSync(srcPath);
const srcPng = PNG.sync.read(srcBuf);

function getPixel(p, x, y) {
  if (x < 0 || x >= p.width || y < 0 || y >= p.height) return [0, 0, 0, 0];
  const idx = (p.width * y + x) << 2;
  return [p.data[idx], p.data[idx + 1], p.data[idx + 2], p.data[idx + 3]];
}

// Function to calculate exact topY for Phone 2 at given sx
function getPhone2TopY(x) {
  if (x < 251) return 999;
  if (x < 265) {
    // Corner: from 164 down to 158
    const t = (x - 251) / 14;
    return 164 - 6 * Math.sqrt(Math.max(0, 1 - Math.pow(1 - t, 2)));
  }
  if (x > 392) return 999;
  if (x > 375) {
    // Corner: from 163 up to 175
    const t = (x - 375) / 17;
    return 163 + 12 * (t * t);
  }
  // Straight top edge slanting from 154 at x=280 to 163 at x=375
  // Slope = (163 - 154) / (375 - 280) = 9 / 95 = 0.0947
  return 154 + (x - 280) * 0.0947;
}

// Function to calculate exact botY for Phone 2 at given sx
function getPhone2BotY(x) {
  if (x < 251 || x > 392) return -999;
  if (x < 268) {
    // Bottom left corner
    const t = (x - 251) / 17;
    return 407 + 9 * Math.sqrt(Math.max(0, 1 - Math.pow(1 - t, 2)));
  }
  if (x > 378) {
    // Bottom right corner
    const t = (x - 378) / 14;
    return 411 - 13 * (t * t);
  }
  // Straight bottom edge slanting from 416 at x=280 to 411 at x=378
  // Slope = (411 - 416) / (378 - 280) = -5 / 98 = -0.051
  return 416 - (x - 280) * 0.051;
}

// Function to calculate exact leftX for Phone 2 at given sy
function getPhone2LeftX(y) {
  if (y < 154 || y > 417) return 999;
  if (y < 172) {
    const t = (y - 154) / 18;
    return 265 - 14 * Math.sqrt(Math.max(0, 1 - Math.pow(1 - t, 2)));
  }
  if (y > 396) {
    const t = (417 - y) / 21;
    return 266 - 15 * Math.sqrt(Math.max(0, 1 - Math.pow(1 - t, 2)));
  }
  // Middle left edge (with volume buttons)
  return 251.5;
}

// Function to calculate exact rightX for Phone 2 at given sy
function getPhone2RightX(y) {
  if (y < 154 || y > 417) return -999;
  if (y < 175) {
    const t = (y - 154) / 21;
    return 377 + 15 * Math.sqrt(Math.max(0, 1 - Math.pow(1 - t, 2)));
  }
  if (y > 395) {
    const t = (417 - y) / 22;
    return 378 + 14 * Math.sqrt(Math.max(0, 1 - Math.pow(1 - t, 2)));
  }
  // Middle right edge
  return 392;
}

// Extract Phone 2
const p2MinX = 250;
const p2MaxX = 394;
const p2MinY = 153;
const p2MaxY = 418;

const p2W = p2MaxX - p2MinX + 1;
const p2H = p2MaxY - p2MinY + 1;
const margin = 6;
const outW = p2W + margin * 2;
const outH = p2H + margin * 2;

const outPng = new PNG({ width: outW, height: outH });
outPng.data.fill(0);

let insideCount = 0;

for (let oy = 0; oy < outH; oy++) {
  const sy = p2MinY + oy - margin;
  for (let ox = 0; ox < outW; ox++) {
    const sx = p2MinX + ox - margin;

    const top = getPhone2TopY(sx);
    const bot = getPhone2BotY(sx);
    const left = getPhone2LeftX(sy);
    const right = getPhone2RightX(sy);

    // Compute distance to boundary:
    const dTop = sy - top;
    const dBot = bot - sy;
    const dLeft = sx - left;
    const dRight = right - sx;

    const minDist = Math.min(dTop, dBot, dLeft, dRight);

    if (minDist < -1.0) {
      // Outside
      continue;
    }

    let alpha = 1.0;
    if (minDist < 1.0) {
      // Smooth 2px anti-aliasing
      alpha = Math.max(0, Math.min(1, (minDist + 1.0) / 2.0));
    }

    const [r, g, b] = getPixel(srcPng, Math.round(sx), Math.round(sy));
    const idx = (outW * oy + ox) << 2;
    outPng.data[idx] = r;
    outPng.data[idx + 1] = g;
    outPng.data[idx + 2] = b;
    outPng.data[idx + 3] = Math.round(255 * alpha);
    if (alpha > 0.5) insideCount++;
  }
}

fs.writeFileSync('assets/feature-phone-2.png', PNG.sync.write(outPng));
console.log(`Saved Phone 2 with exact 3D chassis contour (${outW}x${outH}), inside count: ${insideCount}`);
