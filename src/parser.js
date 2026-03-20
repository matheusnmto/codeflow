import { extname } from 'node:path';
import { parseJS } from './parsers/js.js';
import { parsePython } from './parsers/python.js';
import { parseGo } from './parsers/go.js';
import { parseC } from './parsers/c.js';
import { parseJava } from './parsers/java.js';

const JS_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

/**
 * Route a file to the correct language parser.
 * @param {string} filePath — absolute path
 * @returns {Promise<{functions: {name: string, line: number}[], imports: {from: string, names: string[]}[], exports: string[]} | null>}
 */
export async function parseFile(filePath) {
  const ext = extname(filePath);

  if (JS_EXTENSIONS.has(ext)) return parseJS(filePath);
  if (ext === '.py') return parsePython(filePath);
  if (ext === '.go') return parseGo(filePath);
  if (ext === '.c' || ext === '.cpp' || ext === '.h' || ext === '.hpp') return parseC(filePath);
  if (ext === '.java') return parseJava(filePath);

  return null;
}
