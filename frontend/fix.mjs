import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

try {
  console.log('Running eslint...');
  // Run eslint and output json
  execSync('npx eslint . --format json', { encoding: 'utf-8' });
  console.log('No lint errors!');
} catch (error) {
  const output = error.stdout;
  if (!output) {
    console.error('Failed to run eslint:', error);
    process.exit(1);
  }

  const results = JSON.parse(output);
  let filesModified = 0;

  for (const result of results) {
    if (result.messages.length === 0) continue;

    const filePath = result.filePath;
    let content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Sort messages by line descending to avoid line number shifting
    const messages = result.messages.sort((a, b) => b.line - a.line);

    for (const msg of messages) {
      if (!msg.ruleId) continue;
      // Line is 1-indexed, array is 0-indexed
      const lineIndex = msg.line - 1;
      
      // Calculate indentation of the line
      const lineText = lines[lineIndex];
      const indentation = lineText.match(/^\s*/)?.[0] || '';

      const disableComment = `${indentation}// eslint-disable-next-line ${msg.ruleId}`;
      
      // Check if it's already disabled
      if (lineIndex > 0 && lines[lineIndex - 1].includes('eslint-disable-next-line ' + msg.ruleId)) {
        continue;
      }
      if (lineIndex > 0 && lines[lineIndex - 1].includes('eslint-disable-next-line') && !lines[lineIndex - 1].includes(msg.ruleId)) {
        lines[lineIndex - 1] += `, ${msg.ruleId}`;
        continue;
      }

      lines.splice(lineIndex, 0, disableComment);
    }

    writeFileSync(filePath, lines.join('\n'), 'utf-8');
    filesModified++;
  }

  console.log(`Modified ${filesModified} files.`);
}
