import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

function replaceInFile(filePath) {
  const ext = path.extname(filePath);
  if (['.js', '.jsx'].includes(ext)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace single quotes with backticks if the string contains ${...}
    content = content.replace(/'(\/api\/[^']*\$\{[^}]+\}[^']*)'/g, "`$1`");

    fs.writeFileSync(filePath, content);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else {
      replaceInFile(fullPath);
    }
  });
}

traverse(srcDir);
console.log('Fixed template literals');
