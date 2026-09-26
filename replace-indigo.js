const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkSync(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let filepath = path.join(dir, file);
    let stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walkSync(filepath, callback);
    } else if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
      callback(filepath);
    }
  });
}

const replacements = [
  [/bg-indigo-600/g, 'bg-primary'],
  [/bg-indigo-500/g, 'bg-primary'],
  [/bg-indigo-100/g, 'bg-primary/10'],
  [/bg-indigo-50/g, 'bg-primary/5'],
  [/text-indigo-700/g, 'text-primary'],
  [/text-indigo-600/g, 'text-primary'],
  [/text-indigo-500/g, 'text-primary'],
  [/border-indigo-200/g, 'border-primary/20'],
  [/border-indigo-600/g, 'border-primary'],
  [/ring-indigo-500/g, 'ring-primary'],
  [/ring-indigo-600/g, 'ring-primary'],
  [/hover:bg-indigo-700/g, 'hover:bg-primary/90'],
  [/hover:bg-indigo-600/g, 'hover:bg-primary'],
  [/hover:bg-indigo-50/g, 'hover:bg-primary/5'],
  [/hover:text-indigo-600/g, 'hover:text-primary'],
  [/hover:text-indigo-500/g, 'hover:text-primary'],
  [/focus:ring-indigo-500/g, 'focus:ring-primary'],
  [/focus:ring-indigo-600/g, 'focus:ring-primary'],
  [/focus:border-indigo-500/g, 'focus:border-primary'],
  [/focus:border-indigo-600/g, 'focus:border-primary'],
  [/focus-within:border-indigo-600/g, 'focus-within:border-primary'],
  [/focus-within:ring-indigo-600/g, 'focus-within:ring-primary'],
];

walkSync(srcDir, (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let newContent = content;
  
  for (const [regex, replacement] of replacements) {
    newContent = newContent.replace(regex, replacement);
  }
  
  if (content !== newContent) {
    fs.writeFileSync(filepath, newContent, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
