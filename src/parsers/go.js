import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Parse a Go file by calling the external parse_go.go script.
 * @param {string} filePath — absolute path to a .go file
 * @returns {{ functions: {name: string, line: number}[], imports: {from: string, names: string[]}[], exports: string[] } | null}
 */
export function parseGo(filePath) {
  const scriptPath = resolve(__dirname, '../scripts/parse_go.go');
  const output = execSync(`go run "${scriptPath}" "${filePath}"`, {
    encoding: 'utf-8',
    timeout: 30000,
  });
  const result = JSON.parse(output);
  if (result.error) return null;
  return result;
}
