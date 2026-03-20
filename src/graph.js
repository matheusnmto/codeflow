import { relative } from 'node:path';
import { parseFile } from './parser.js';

/**
 * Build the in-memory dependency graph.
 * @param {string} rootPath — the root path used for relative display
 * @param {string[]} filePaths — absolute file paths
 * @returns {Promise<{ graph: Record<string, object>, errors: string[], stats: { files: number, functions: number, connections: number } }>}
 */
export async function buildGraph(rootPath, filePaths) {
  const graph = {};
  const errors = [];
  let totalFunctions = 0;
  let totalConnections = 0;

  for (const filePath of filePaths) {
    const relPath = relative(rootPath, filePath);
    try {
      const result = await parseFile(filePath);
      if (!result) {
        errors.push(relPath);
        continue;
      }
      graph[relPath] = result;
      totalFunctions += result.functions.length;
      totalConnections += result.imports.length;
    } catch (err) {
      errors.push(relPath);
    }
  }

  return {
    graph,
    errors,
    stats: {
      files: Object.keys(graph).length,
      functions: totalFunctions,
      connections: totalConnections,
    },
  };
}
