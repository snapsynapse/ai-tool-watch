const fs = require('fs');
const path = require('path');

const platformsDir = './data/platforms';

// Read all platform files
const files = fs.readdirSync(platformsDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  const filePath = path.join(platformsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix duplicate API rows by removing the pattern "| API | ... |\n| API | ... |"
  // The second API row (with the extra API entry) needs to be removed
  
  // Pattern: API row followed by another API row - remove the second one
  const lines = content.split('\n');
  const newLines = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Check if this is an API row in a platform table
    if (line.startsWith('| API |')) {
      newLines.push(line);
      i++;
      // Skip any immediately following duplicate API rows
      while (i < lines.length && lines[i].startsWith('| API |')) {
        console.log(`Removing duplicate API row in ${file}: ${lines[i]}`);
        i++;
      }
    } else {
      newLines.push(line);
      i++;
    }
  }
  
  const newContent = newLines.join('\n');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed ${file}`);
  }
}

console.log('\nDone!');
