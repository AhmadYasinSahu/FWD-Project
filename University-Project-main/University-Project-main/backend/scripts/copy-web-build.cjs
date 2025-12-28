const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const sourceDir = path.join(repoRoot, 'build');
const destDir = path.join(__dirname, '..', 'web-build');

function rmDirSafe(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

function copyDirRecursive(src, dst) {
  const stat = fs.statSync(src);
  if (!stat.isDirectory()) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    return;
  }

  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, dstPath);
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(dstPath), { recursive: true });
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

if (!fs.existsSync(sourceDir)) {
  console.error(`React build folder not found: ${sourceDir}`);
  console.error('Run `npm run build` in the repo root first.');
  process.exit(1);
}

rmDirSafe(destDir);
copyDirRecursive(sourceDir, destDir);

const indexHtml = path.join(destDir, 'index.html');
if (!fs.existsSync(indexHtml)) {
  console.error(`Expected index.html not found after copy: ${indexHtml}`);
  process.exit(1);
}

console.log(`Copied React build -> ${destDir}`);
