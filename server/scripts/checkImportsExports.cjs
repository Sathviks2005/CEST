const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') results = results.concat(walk(full));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('client/src');
const fileExports = new Map();

// Step 1: Collect exports
files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  const exp = new Set();
  let hasDefault = false;

  const namedRegex = /export\s+(?:const|let|var|function|class)\s+([A-Za-z0-9_$]+)/g;
  let m;
  while ((m = namedRegex.exec(code))) {
    exp.add(m[1]);
  }
  const listRegex = /export\s*\{\s*([^}]+)\s*\}/g;
  while ((m = listRegex.exec(code))) {
    m[1].split(',').forEach(item => {
      const parts = item.trim().split(/\s+as\s+/);
      const name = (parts[1] || parts[0]).trim();
      if (name && name !== 'default') exp.add(name);
      if (parts[1] === 'default' || parts[0] === 'default') hasDefault = true;
    });
  }
  if (/export\s+default\s+/.test(code)) hasDefault = true;

  fileExports.set(file.replace(/\\/g, '/'), { exp, hasDefault });
});

// Step 2: Check relative imports
let issues = 0;
files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s+([^'"\n]+)\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = importRegex.exec(code))) {
    const clause = m[1].trim();
    const target = m[2];

    if (!target.startsWith('.')) continue; // skip third-party
    
    const dir = path.dirname(file);
    let resolved = path.resolve(dir, target).replace(/\\/g, '/');
    if (!fs.existsSync(resolved)) {
      if (fs.existsSync(resolved + '.js')) resolved = resolved + '.js';
      else if (fs.existsSync(resolved + '.jsx')) resolved = resolved + '.jsx';
      else if (fs.existsSync(resolved + '/index.js')) resolved = resolved + '/index.js';
      else if (fs.existsSync(resolved + '/index.jsx')) resolved = resolved + '/index.jsx';
      else {
        console.error('MISSING FILE:', target, 'in', file);
        issues++;
        continue;
      }
    }

    const targetInfo = fileExports.get(resolved);
    if (!targetInfo) continue;

    const namedMatch = clause.match(/\{([^}]+)\}/);
    if (namedMatch) {
      const names = namedMatch[1].split(',').map(n => n.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean);
      names.forEach(name => {
        if (!targetInfo.exp.has(name)) {
          console.error(`IMPORT MISMATCH: "${name}" imported from "${target}" in "${file}", but not exported!`);
          issues++;
        }
      });
    }
  }
});

console.log('Finished import check. Issues found:', issues);
