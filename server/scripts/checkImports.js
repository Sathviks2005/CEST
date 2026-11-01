const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../../client/src');

function getExportNames(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const namedExports = new Set();
  let hasDefault = false;

  // export const Foo / export function Foo / export class Foo
  const namedMatches = content.matchAll(/export\s+(?:const|let|var|function|class)\s+([A-Za-z0-9_$]+)/g);
  for (const m of namedMatches) {
    namedExports.add(m[1]);
  }

  // export { A, B as C }
  const blockMatches = content.matchAll(/export\s*\{([^}]+)\}/g);
  for (const m of blockMatches) {
    const items = m[1].split(',');
    for (const item of items) {
      const parts = item.trim().split(/\s+as\s+/);
      const expName = (parts[1] || parts[0]).trim();
      if (expName) namedExports.add(expName);
    }
  }

  if (/export\s+default\s+/.test(content)) {
    hasDefault = true;
  }

  return { namedExports, hasDefault };
}

function resolveImportPath(importingFile, importPath) {
  if (!importPath.startsWith('.')) return null; // node_modules
  const dir = path.dirname(importingFile);
  const resolved = path.resolve(dir, importPath);

  const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];
  for (const ext of extensions) {
    const full = resolved + ext;
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      return full;
    }
  }
  return null;
}

function checkFileImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // import { A, B } from 'path'
  const importMatches = content.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g);
  const errors = [];

  for (const m of importMatches) {
    const importedNames = m[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean);
    const importSource = m[2];
    const targetFile = resolveImportPath(filePath, importSource);

    if (targetFile) {
      const { namedExports } = getExportNames(targetFile);
      for (const name of importedNames) {
        if (!namedExports.has(name)) {
          errors.push({
            file: path.relative(srcDir, filePath),
            imported: name,
            from: importSource,
            targetFile: path.relative(srcDir, targetFile),
            available: Array.from(namedExports),
          });
        }
      }
    }
  }

  // Also check default imports: import Foo from 'path'
  const defaultMatches = content.matchAll(/import\s+([A-Za-z0-9_$]+)\s+from\s*['"]([^'"]+)['"]/g);
  for (const m of defaultMatches) {
    const defaultName = m[1];
    const importSource = m[2];
    if (defaultName === 'React') continue;
    const targetFile = resolveImportPath(filePath, importSource);
    if (targetFile) {
      const { hasDefault, namedExports } = getExportNames(targetFile);
      if (!hasDefault) {
        errors.push({
          file: path.relative(srcDir, filePath),
          defaultImport: defaultName,
          from: importSource,
          targetFile: path.relative(srcDir, targetFile),
          available: Array.from(namedExports),
        });
      }
    }
  }

  return errors;
}

function scanDir(dir) {
  let allErrors = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      allErrors = allErrors.concat(scanDir(full));
    } else if (/\.(jsx?|tsx?)$/.test(e.name)) {
      allErrors = allErrors.concat(checkFileImports(full));
    }
  }
  return allErrors;
}

console.log('Scanning client/src for import/export mismatches...');
const errors = scanDir(srcDir);
if (errors.length === 0) {
  console.log('No static import/export mismatches found.');
} else {
  console.log(`Found ${errors.length} potential import/export mismatches:`);
  console.log(JSON.stringify(errors, null, 2));
}
