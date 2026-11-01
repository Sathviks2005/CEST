const fs = require('fs');
const path = require('path');
const fa = require('../../client/node_modules/react-icons/fa');

const srcDir = path.resolve(__dirname, '../../client/src');

function checkIconsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const matches = content.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]react-icons\/fa['"]/g);
  const invalid = [];

  for (const m of matches) {
    const icons = m[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean);
    for (const icon of icons) {
      if (!fa[icon]) {
        invalid.push({ icon, file: path.relative(srcDir, filePath) });
      }
    }
  }
  return invalid;
}

function scanDir(dir) {
  let list = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) list = list.concat(scanDir(full));
    else if (/\.(jsx?|tsx?)$/.test(e.name)) list = list.concat(checkIconsInFile(full));
  }
  return list;
}

const invalidIcons = scanDir(srcDir);
console.log('Invalid react-icons/fa imports:', JSON.stringify(invalidIcons, null, 2));
