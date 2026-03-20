import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Parse a Python file by calling the external parse_python.py script.
 * @param {string} filePath — absolute path to a .py file
 * @returns {{ functions: {name: string, line: number}[], imports: {from: string, names: string[]}[], exports: string[] } | null}
 */
export function parsePython(filePath) {
  const scriptPath = resolve(__dirname, '../scripts/parse_python.py');
  const output = execSync(`python3 "${scriptPath}" "${filePath}"`, {
    encoding: 'utf-8',
    timeout: 10000,
  });
  const result = JSON.parse(output);
  if (result.error) return null;
  return result;
}
