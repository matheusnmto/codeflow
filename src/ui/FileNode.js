import React from 'react';
import { Text, Box } from 'ink';
import chalk from 'chalk';
import { extname } from 'node:path';

const e = React.createElement;

/**
 * Get a colored language tag for the file.
 */
function langTag(file) {
  const ext = extname(file).slice(1); // remove leading dot
  const tagMap = {
    py: chalk.blue('[py]'),
    go: chalk.cyan('[go]'),
    js: chalk.yellow('[js]'),
    jsx: chalk.yellow('[jsx]'),
    ts: chalk.yellow('[ts]'),
    tsx: chalk.yellow('[tsx]'),
    c: chalk.gray('[c]'),
    cpp: chalk.rgb(180, 180, 180)('[c++]'),
    h: chalk.gray('[h]'),
    hpp: chalk.rgb(180, 180, 180)('[hpp]'),
    java: chalk.red('[java]'),
  };
  return tagMap[ext] || chalk.gray(`[${ext}]`);
}

/**
 * FileNode — renders a single file entry.
 * Collapsed: ▶ filename [lang]  N funções  N imports
 * Expanded:  ▼ filename + detail rows
 * Selected:  cyan background, black text on file row
 */
export default function FileNode({ file, data, isSelected, isExpanded }) {
  const fnCount = data.functions.length;
  const impCount = data.imports.length;
  const fnLabel = fnCount === 1 ? '1 função' : `${fnCount} funções`;
  const impLabel = `${impCount} import${impCount !== 1 ? 's' : ''}`;
  const arrow = isExpanded ? '▼' : '▶';
  const tag = langTag(file);

  // ── File header row ───────────────────────────────────────
  const headerPlain = `  ${arrow} ${file.padEnd(26)} `;
  const headerSuffix = `  ${fnLabel.padEnd(12)} ${impLabel}`;

  const header = isSelected
    ? e(Text, { backgroundColor: 'cyan', color: 'black', bold: true },
        `${headerPlain}${tag}${headerSuffix}`)
    : isExpanded
      ? e(Text, { color: 'whiteBright', bold: true },
          `${headerPlain}${tag}${headerSuffix}`)
      : e(Text, { color: 'gray' },
          `${headerPlain}${tag}${headerSuffix}`);

  if (!isExpanded) {
    return e(Box, { flexDirection: 'column' }, header);
  }

  // ── Detail rows (only when expanded) ─────────────────────
  const details = [];

  // Functions
  for (const fn of data.functions) {
    const name = fn.name.padEnd(22);
    details.push(
      e(Text, { key: `fn-${fn.name}-${fn.line}` },
        `      ${chalk.blue('ƒ')} ${chalk.white(name)} ${chalk.gray(`linha ${fn.line}`)}`)
    );
  }

  // Imports
  for (const imp of data.imports) {
    const names = imp.names.join(', ');
    details.push(
      e(Text, { key: `imp-${imp.from}` },
        `      ${chalk.yellow('↓')} ${chalk.white(imp.from)} → ${chalk.yellow(names)}`)
    );
  }

  // Exports
  if (data.exports.length > 0) {
    details.push(
      e(Text, { key: 'exports' },
        `      ${chalk.green('↑')} ${chalk.green('exports:')} ${chalk.white(data.exports.join(', '))}`)
    );
  }

  return e(Box, { flexDirection: 'column' }, header, ...details);
}
