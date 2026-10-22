const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found, skipping optimization.');
  process.exit(0);
}

// Find the hashed proof-jump webp asset in dist/assets
let proofAssetPath = '';
const assetsNestedDir = path.join(distDir, 'assets', 'assets');
if (fs.existsSync(assetsNestedDir)) {
  const files = fs.readdirSync(assetsNestedDir);
  const found = files.find(f => f.startsWith('proof-jump') && f.endsWith('.webp'));
  if (found) {
    proofAssetPath = `/assets/assets/${found}`;
  }
}

if (!proofAssetPath) {
  // Try directly under dist/assets
  const assetsDir = path.join(distDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const found = files.find(f => f.startsWith('proof-jump') && f.endsWith('.webp'));
    if (found) {
      proofAssetPath = `/assets/${found}`;
    }
  }
}

let html = fs.readFileSync(indexPath, 'utf8');

// Set lang to it
html = html.replace(/<html lang="[^"]*">/, '<html lang="it">');

// Add performance head tags: instant dark background, preload LCP image
const preloadTags = [
  '    <meta name="theme-color" content="#000000" />',
  '    <meta name="color-scheme" content="dark" />',
  '    <style>html, body { background-color: #000000 !important; color: #FFFFFF; }</style>',
];

if (proofAssetPath) {
  console.log(`Preloading LCP image: ${proofAssetPath}`);
  preloadTags.push(`    <link rel="preload" as="image" href="${proofAssetPath}" type="image/webp" fetchpriority="high" />`);
}

const headInsertion = '\n' + preloadTags.join('\n') + '\n  </head>';
html = html.replace('</head>', headInsertion);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('dist/index.html successfully optimized for maximum performance & instant LCP!');
