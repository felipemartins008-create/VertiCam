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

// Function to generate a phone with pixel-perfect contour cutout and smooth anti-aliased alpha
function extractPhone(cfg) {
  const { name, leftX, rightX, topY, botY, radius, isHero } = cfg;
  const w = rightX - leftX + 1;
  const h = botY - topY + 1;

  // Add 4px transparent margin so shadow/anti-aliasing never clips at image border
  const margin = 4;
  const outW = w + margin * 2;
  const outH = h + margin * 2;

  const outPng = new PNG({ width: outW, height: outH });
  // Fill all with 0 alpha by default
  outPng.data.fill(0);

  // For each pixel in output image:
  for (let oy = 0; oy < outH; oy++) {
    const sy = topY + oy - margin;
    for (let ox = 0; ox < outW; ox++) {
      const sx = leftX + ox - margin;

      // Check distance to rounded-rect chassis
      // Corner bounds
      const localX = ox - margin;
      const localY = oy - margin;

      let distOutside = 0;
      if (localX < 0 || localX >= w || localY < 0 || localY >= h) {
        // Outside the bounding box
        const dx = localX < 0 ? -localX : localX >= w ? localX - (w - 1) : 0;
        const dy = localY < 0 ? -localY : localY >= h ? localY - (h - 1) : 0;
        distOutside = Math.sqrt(dx * dx + dy * dy);
      } else {
        // Check 4 rounded corners
        let cornerDx = 0, cornerDy = 0;
        if (localX < radius && localY < radius) {
          cornerDx = radius - localX;
          cornerDy = radius - localY;
        } else if (localX >= w - radius && localY < radius) {
          cornerDx = localX - (w - 1 - radius);
          cornerDy = radius - localY;
        } else if (localX < radius && localY >= h - radius) {
          cornerDx = radius - localX;
          cornerDy = localY - (h - 1 - radius);
        } else if (localX >= w - radius && localY >= h - radius) {
          cornerDx = localX - (w - 1 - radius);
          cornerDy = localY - (h - 1 - radius);
        }

        if (cornerDx > 0 && cornerDy > 0) {
          const cornerDist = Math.sqrt(cornerDx * cornerDx + cornerDy * cornerDy);
          if (cornerDist > radius) {
            distOutside = cornerDist - radius;
          }
        }
      }

      // If outside phone boundary:
      if (distOutside >= 1.5) {
        // Pure transparent
        continue;
      }

      // Smooth 1.5px anti-aliased edge
      let alphaMultiplier = 1.0;
      if (distOutside > 0) {
        alphaMultiplier = Math.max(0, 1.0 - distOutside / 1.5);
      }

      const [r, g, b] = getPixel(srcPng, sx, sy);
      const outIdx = (outW * oy + ox) << 2;
      outPng.data[outIdx] = r;
      outPng.data[outIdx + 1] = g;
      outPng.data[outIdx + 2] = b;
      outPng.data[outIdx + 3] = Math.round(255 * alphaMultiplier);
    }
  }

  const outBuf = PNG.sync.write(outPng);
  fs.writeFileSync('assets/' + name, outBuf);
  console.log(`Saved assets/${name} (${outW}x${outH}) - strictly trimmed, transparent outside`);
}

// Phone 1
extractPhone({
  name: 'feature-phone-1.png',
  leftX: 68,
  rightX: 202,
  topY: 156,
  botY: 411,
  radius: 24,
});

// Phone 2 (Featured Hero phone: exactly from metallic cyan rim X=252 to X=392, top Y=157 to Y=414)
extractPhone({
  name: 'feature-phone-2.png',
  leftX: 252,
  rightX: 392,
  topY: 157,
  botY: 414,
  radius: 25,
  isHero: true,
});

// Phone 3
extractPhone({
  name: 'feature-phone-3.png',
  leftX: 444,
  rightX: 578,
  topY: 156,
  botY: 411,
  radius: 24,
});

// Phone 4
extractPhone({
  name: 'feature-phone-4.png',
  leftX: 632,
  rightX: 766,
  topY: 156,
  botY: 411,
  radius: 24,
});

// Phone 5
extractPhone({
  name: 'feature-phone-5.png',
  leftX: 823,
  rightX: 956,
  topY: 156,
  botY: 411,
  radius: 24,
});
