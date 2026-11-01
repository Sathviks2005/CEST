const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const clientSrc = path.resolve(__dirname, '..', 'client', 'src');

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

const files = getAllFiles(clientSrc, ['.js', '.jsx']);

const iconPrefixMap = {
  Fa: 'react-icons/fa',
  Fi: 'react-icons/fi',
  Md: 'react-icons/md',
  Hi2: 'react-icons/hi2',
  Hi: 'react-icons/hi',
  Io5: 'react-icons/io5',
  Io: 'react-icons/io',
  Bs: 'react-icons/bs',
  Ri: 'react-icons/ri',
  Tb: 'react-icons/tb',
  Ai: 'react-icons/ai',
  Bi: 'react-icons/bi',
  Cg: 'react-icons/cg',
  Go: 'react-icons/go',
  Gr: 'react-icons/gr',
  Im: 'react-icons/im',
  Rx: 'react-icons/rx',
  Si: 'react-icons/si',
  Sl: 'react-icons/sl',
  Ti: 'react-icons/ti',
  Vsc: 'react-icons/vsc',
  Wi: 'react-icons/wi'
};

const issues = [];
const wrongImports = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let ast;
  try {
    ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (err) {
    console.error(`Parse error in ${file}:`, err.message);
    continue;
  }

  // Check imports first: is any icon imported from the wrong react-icons package?
  traverse(ast, {
    ImportDeclaration(importPath) {
      const source = importPath.node.source.value;
      for (const specifier of importPath.node.specifiers) {
        if (specifier.type === 'ImportSpecifier') {
          const importedName = specifier.imported.name;
          if (source.startsWith('react-icons/')) {
            // Check prefix
            for (const [prefix, expectedPkg] of Object.entries(iconPrefixMap)) {
              if (importedName.startsWith(prefix) && importedName.length > prefix.length && importedName[prefix.length] === importedName[prefix.length].toUpperCase()) {
                if (source !== expectedPkg && !(prefix === 'Hi' && source === 'react-icons/hi2') && !(prefix === 'Io' && source === 'react-icons/io5')) {
                  wrongImports.push({
                    file: path.relative(path.resolve(__dirname, '..'), file),
                    icon: importedName,
                    source,
                    expectedPkg
                  });
                }
                break;
              }
            }
          }
        }
      }
    },
    // Check all JSX elements and identifiers referencing icons
    JSXIdentifier(idPath) {
      const name = idPath.node.name;
      for (const prefix of Object.keys(iconPrefixMap)) {
        if (name.startsWith(prefix) && name.length > prefix.length && name[prefix.length] === name[prefix.length].toUpperCase()) {
          // Check if parent is JSXOpeningElement or JSXClosingElement name
          if (idPath.parent.type === 'JSXOpeningElement' || idPath.parent.type === 'JSXClosingElement') {
            if (!idPath.scope.hasBinding(name)) {
              issues.push({
                file: path.relative(path.resolve(__dirname, '..'), file),
                icon: name,
                line: idPath.node.loc?.start?.line,
                type: 'JSX element not defined'
              });
            }
          }
          break;
        }
      }
    },
    Identifier(idPath) {
      const name = idPath.node.name;
      for (const prefix of Object.keys(iconPrefixMap)) {
        if (name.startsWith(prefix) && name.length > prefix.length && name[prefix.length] === name[prefix.length].toUpperCase()) {
          // Exclude property definitions, import specifiers, object keys (unless shorthand)
          if (idPath.parent.type === 'MemberExpression' && idPath.parent.property === idPath.node && !idPath.parent.computed) {
            return;
          }
          if (idPath.parent.type === 'Property' && idPath.parent.key === idPath.node && !idPath.parent.computed && !idPath.parent.shorthand) {
            return;
          }
          if (idPath.parent.type === 'ImportSpecifier' || idPath.parent.type === 'ImportDefaultSpecifier') {
            return;
          }
          if (idPath.parent.type === 'VariableDeclarator' && idPath.parent.id === idPath.node) {
            return;
          }
          if (idPath.parent.type === 'FunctionDeclaration' && idPath.parent.id === idPath.node) {
            return;
          }

          if (!idPath.scope.hasBinding(name)) {
            // Check if global
            issues.push({
              file: path.relative(path.resolve(__dirname, '..'), file),
              icon: name,
              line: idPath.node.loc?.start?.line,
              type: 'Identifier not in scope'
            });
          }
          break;
        }
      }
    }
  });
}

console.log('=== UNDEFINED ICONS ===');
console.log(JSON.stringify(issues, null, 2));
console.log('=== WRONG PACKAGE IMPORTS ===');
console.log(JSON.stringify(wrongImports, null, 2));
