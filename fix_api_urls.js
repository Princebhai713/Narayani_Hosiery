import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

function replaceInFile(filePath) {
  const ext = path.extname(filePath);
  if (['.js', '.jsx'].includes(ext)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace the specific pattern back to relative URLs
    content = content.replace(/`\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000'\}\/api([^`]*)`/g, "'/api$1'");
    // Also remove the explicit API_URL variable definition if any
    content = content.replace(/const API_URL = import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000';\n\s*/g, '');

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
console.log('Reverted to relative API URLs');
