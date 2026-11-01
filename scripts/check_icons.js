const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, exts));
    } else if (exts.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

const clientSrc = path.resolve(__dirname, '..', 'client', 'src');
const files = getAllFiles(clientSrc, ['.js', '.jsx', '.ts', '.tsx']);

const iconPrefixes = ['Fa', 'Fi', 'Md', 'Hi', 'Hi2', 'Io', 'Io5', 'Bs', 'Ri', 'Tb', 'Ai', 'Bi', 'Cg', 'Go', 'Gr', 'Im', 'Rx', 'Si', 'Sl', 'Ti', 'Vsc', 'Wi'];

const missingImports = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  // Match imported identifiers
  const importedIdentifiers = new Set();
  const importBlockRegex = /import\s+([\s\S]*?)\s+from\s+['"][^'"]+['"]/g;
  let match;
  while ((match = importBlockRegex.exec(content)) !== null) {
    const clause = match[1];
    const cleaned = clause.replace(/[{}]/g, '').split(',');
    for (let n of cleaned) {
      n = n.trim();
      if (n.includes(' as ')) {
        n = n.split(/\s+as\s+/)[1].trim();
      }
      if (n) importedIdentifiers.add(n);
    }
  }

  // Also identifiers defined in file: const/function/class/let/var
  const definedRegex = /\b(?:const|let|var|function|class)\s+([a-zA-Z0-9_$]+)/g;
  while ((match = definedRegex.exec(content)) !== null) {
    importedIdentifiers.add(match[1]);
  }

  // Strip comments and strings
  const stripped = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');

  const iconTokenRegex = /\b((?:Fa|Fi|Md|Hi|Hi2|Io|Io5|Bs|Ri|Tb|Ai|Bi|Cg|Go|Gr|Im|Rx|Si|Sl|Ti|Vsc|Wi)[A-Z0-9][a-zA-Z0-9]*)\b/g;
  let tokenMatch;
  while ((tokenMatch = iconTokenRegex.exec(stripped)) !== null) {
    const token = tokenMatch[1];
    // Check if imported or defined
    if (!importedIdentifiers.has(token)) {
      // Also check standard global / React names or false positives
      if (['File', 'FileReader', 'FormData', 'FinalizationRegistry'].includes(token)) continue;
      missingImports.push({ file: path.relative(path.resolve(__dirname, '..'), file), icon: token });
    }
  }
}

// Deduplicate
const unique = [];
const seen = new Set();
for (const item of missingImports) {
  const key = `${item.file}::${item.icon}`;
  if (!seen.has(key)) {
    seen.add(key);
    unique.push(item);
  }
}

console.log(JSON.stringify(unique, null, 2));
