import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Parse a Java file by calling the external parse_java.py script.
 */
export function parseJava(filePath) {
  const scriptPath = resolve(__dirname, '../scripts/parse_java.py');
  const output = execSync(`python3 "${scriptPath}" "${filePath}"`, {
    encoding: 'utf-8',
    timeout: 10000,
  });
  const result = JSON.parse(output);
  if (result.error) return null;
  return result;
}
