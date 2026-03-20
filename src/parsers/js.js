import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

// Handle CJS default export interop
const traverse = _traverse.default || _traverse;

/**
 * Parse a JS/TS file and extract functions, imports, and exports.
 * @param {string} filePath — absolute path
 * @returns {Promise<{functions: {name: string, line: number}[], imports: {from: string, names: string[]}[], exports: string[]} | null>}
 */
export async function parseJS(filePath) {
  const code = await readFile(filePath, 'utf-8');
  const ext = extname(filePath);
  const isTS = ext === '.ts' || ext === '.tsx';
  const isJSX = ext === '.jsx' || ext === '.tsx';

  const plugins = ['decorators-legacy', 'classProperties', 'dynamicImport'];
  if (isTS) plugins.push('typescript');
  if (isJSX || !isTS) plugins.push('jsx');

  const ast = parse(code, {
    sourceType: 'module',
    allowImportExportEverywhere: true,
    plugins,
  });

  const functions = [];
  const imports = [];
  const exports = [];

  traverse(ast, {
    FunctionDeclaration(path) {
      if (path.node.id) {
        functions.push({ name: path.node.id.name, line: path.node.loc.start.line });
      }
    },

    VariableDeclarator(path) {
      const init = path.node.init;
      if (
        init &&
        (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression') &&
        path.node.id?.type === 'Identifier'
      ) {
        functions.push({ name: path.node.id.name, line: path.node.loc.start.line });
      }
    },

    ClassMethod(path) {
      if (path.node.key?.type === 'Identifier') {
        functions.push({ name: path.node.key.name, line: path.node.loc.start.line });
      }
    },

    ImportDeclaration(path) {
      const source = path.node.source.value;
      const names = path.node.specifiers.map((s) => {
        if (s.type === 'ImportDefaultSpecifier') return 'default';
        if (s.type === 'ImportNamespaceSpecifier') return `* as ${s.local.name}`;
        return s.imported?.name || s.local.name;
      });
      imports.push({ from: source, names });
    },

    ExportNamedDeclaration(path) {
      const decl = path.node.declaration;
      if (decl) {
        if (decl.type === 'FunctionDeclaration' && decl.id) {
          exports.push(decl.id.name);
        } else if (decl.type === 'VariableDeclaration') {
          for (const d of decl.declarations) {
            if (d.id?.type === 'Identifier') exports.push(d.id.name);
          }
        } else if (decl.type === 'ClassDeclaration' && decl.id) {
          exports.push(decl.id.name);
        }
      }
      for (const spec of path.node.specifiers) {
        exports.push(spec.exported?.name || spec.local.name);
      }
    },

    ExportDefaultDeclaration(path) {
      const decl = path.node.declaration;
      if (decl.type === 'Identifier') {
        exports.push(`default(${decl.name})`);
      } else if (decl.type === 'FunctionDeclaration' && decl.id) {
        exports.push(`default(${decl.id.name})`);
      } else {
        exports.push('default');
      }
    },
  });

  return { functions, imports, exports };
}
