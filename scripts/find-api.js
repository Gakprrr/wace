const fs = require('fs');
const path = require('path');
const srcDir = 'C:/Users/gakpa/OneDrive/Desktop/Wace/src';

let results = new Set();

function findApiStr(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fullPath.includes('__tests__') || fullPath.includes(path.join('src', 'app', 'api')) || fullPath.includes(path.join('src', 'backend'))) continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findApiStr(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/(["'`])\/api\/.*?\1/g);
      if (matches) {
        matches.forEach(m => results.add(m.replace(/['"`]/g, '')));
      }
    }
  }
}

findApiStr(srcDir);
console.log([...results].sort().join('\n'));
