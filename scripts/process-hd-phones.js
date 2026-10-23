// Processa i mockup HD: rimuove lo sfondo nero (se presente), ritaglia e ridimensiona.
// Uso: node scripts/process-hd-phones.js [1 2 3 4 5]
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const TARGET_H = 840; // ~3x dell'altezza visualizzata (270px) per schermi retina

function lum(d, i) {
  return 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
}

function hasTransparency(png) {
  const { data, width, height } = png;
  const corners = [0, width - 1, (height - 1) * width, height * width - 1];
  return corners.every((p) => data[p * 4 + 3] < 10);
}

// Flood fill dai bordi: i pixel quasi neri connessi al bordo diventano trasparenti
function removeBlackBackground(png) {
  const { data, width: w, height: h } = png;
  const HARD = 14; // sotto: sfondo pieno
  const SOFT = 34; // tra HARD e SOFT: bordo semi-trasparente
  const visited = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    const p = y * w + x;
    if (!visited[p]) { visited[p] = 1; stack.push(p); }
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const p = stack.pop();
    const i = p * 4;
    const l = lum(data, i);
    if (l > SOFT) continue;
    if (l <= HARD) data[i + 3] = 0;
    else data[i + 3] = Math.round(255 * (l - HARD) / (SOFT - HARD));
    if (l > HARD + 6) continue; // non propagare oltre il bordo morbido
    const x = p % w, y = (p / w) | 0;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }
}

function trim(png) {
  const { data, width: w, height: h } = png;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (data[(y * w + x) * 4 + 3] > 12) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  const pad = 4;
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad); maxY = Math.min(h - 1, maxY + pad);
  const out = new PNG({ width: maxX - minX + 1, height: maxY - minY + 1 });
  for (let y = 0; y < out.height; y++) {
    data.copy(out.data, y * out.width * 4, ((minY + y) * w + minX) * 4, ((minY + y) * w + maxX + 1) * 4);
  }
  return out;
}

// Ridimensionamento box-filter con alfa premoltiplicato (nitido e senza aloni)
function resize(png, newH) {
  if (png.height <= newH) return png;
  const scale = png.height / newH;
  const newW = Math.round(png.width / scale);
  const out = new PNG({ width: newW, height: newH });
  const s = png.data;
  for (let oy = 0; oy < newH; oy++) {
    const y0 = oy * scale, y1 = y0 + scale;
    for (let ox = 0; ox < newW; ox++) {
      const x0 = ox * scale, x1 = x0 + scale;
      let r = 0, g = 0, b = 0, a = 0, wsum = 0;
      for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
        const wy = Math.min(y + 1, y1) - Math.max(y, y0);
        for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
          const wx = Math.min(x + 1, x1) - Math.max(x, x0);
          const wgt = wx * wy;
          const i = (y * png.width + x) * 4;
          const al = s[i + 3] / 255;
          r += s[i] * al * wgt; g += s[i + 1] * al * wgt; b += s[i + 2] * al * wgt;
          a += al * wgt; wsum += wgt;
        }
      }
      const o = (oy * newW + ox) * 4;
      if (a > 0) {
        out.data[o] = Math.round(r / a);
        out.data[o + 1] = Math.round(g / a);
        out.data[o + 2] = Math.round(b / a);
      }
      out.data[o + 3] = Math.round((a / wsum) * 255);
    }
  }
  return out;
}

const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['1', '2', '3', '4', '5'];
for (const id of ids) {
  const src = path.join('assets', 'hd', `feature-phone-${id}.png`);
  if (!fs.existsSync(src)) { console.log(`skip ${src} (missing)`); continue; }
  let png = PNG.sync.read(fs.readFileSync(src));
  const transparent = hasTransparency(png);
  if (!transparent) removeBlackBackground(png);
  png = trim(png);
  png = resize(png, TARGET_H);
  const dst = path.join('assets', `feature-phone-${id}.png`);
  fs.writeFileSync(dst, PNG.sync.write(png));
  console.log(`${dst}: ${png.width}x${png.height} (source ${transparent ? 'transparent' : 'black bg removed'})`);
}
