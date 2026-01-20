const fs = require('fs');
const path = require('path');

const platformsDir = './data/platforms';

// Read all platform files
const files = fs.readdirSync(platformsDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  const filePath = path.join(platformsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // The pattern we need to fix is:
  // | API | ❌ |  |\n\n| API | ✅ | ... |
  // We need to replace this with just:
  // | API | ✅ | ... |
  
  // Also fix:
  // | API | ❌ |  |\n\n| API | ❌ | ... |
  // Replace with:
  // | API | ❌ | ... |
  
  // Regex to match the pattern
  const pattern = /\| API \| [❌✅⚠️] \|[^|]*\|\n\n\| API \| ([❌✅⚠️]) \| ([^|]*)\|/g;
  
  let newContent = content.replace(pattern, (match, status, notes) => {
    console.log(`Fixing in ${file}: replacing duplicate API pattern`);
    return `| API | ${status} | ${notes}|`;
  });
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed ${file}`);
  }
}

console.log('\nDone!');
