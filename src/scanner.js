import { readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const VALID_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.c', '.cpp', '.h', '.hpp', '.java']);
const IGNORED_DIRS = new Set(['node_modules', 'dist', '.next', 'build', '__pycache__', '.venv', 'venv']);

/**
 * Recursively scans a path and returns all JS/TS file paths.
 * @param {string} rootPath — absolute path to a file or directory
 * @returns {Promise<string[]>} — array of absolute file paths
 */
export async function scan(rootPath) {
  const info = await stat(rootPath);

  if (info.isFile()) {
    return VALID_EXTENSIONS.has(extname(rootPath)) ? [rootPath] : [];
  }

  return walkDir(rootPath);
}

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function walkDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      const nested = await walkDir(fullPath);
      files.push(...nested);
    } else if (entry.isFile() && VALID_EXTENSIONS.has(extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}
