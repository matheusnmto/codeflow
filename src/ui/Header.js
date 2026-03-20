import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const e = React.createElement;

// Read version and author from package.json
const pkgPath = resolve(__dirname, '../../../package.json');
let version = '1.0.0';
let author = '@matheusnmto';
try {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  if (pkg.version) version = pkg.version;
  // If author field isn't explicitly `@matheusnmto`, we fallback to the requested default
} catch (err) {
  // ignore
}

// Helper to create a vertical gradient for the ASCII art using chalk
function gradientString(lines) {
  const colors = [
    chalk.hex('#00ffff'), // cyan
    chalk.hex('#00e6ff'),
    chalk.hex('#00ccff'),
    chalk.hex('#00b3ff'),
    chalk.hex('#0099ff'),
    chalk.hex('#0080ff'), // blue
  ];
  return lines.map((line, i) => {
    const colorFn = colors[Math.min(i, colors.length - 1)];
    return colorFn(line);
  }).join('\n');
}

const asciiArt = [
  "   ██████╗ ██████╗ ██████╗ ███████╗███████╗██╗      ██████╗ ██╗    ██╗",
  "  ██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔════╝██║     ██╔═══██╗██║    ██║",
  "  ██║     ██║   ██║██║  ██║█████╗  █████╗  ██║     ██║   ██║██║ █╗ ██║",
  "  ██║     ██║   ██║██║  ██║██╔══╝  ██╔══╝  ██║     ██║   ██║██║███╗██║",
  "  ╚██████╗╚██████╔╝██████╔╝███████╗██║     ███████╗╚██████╔╝╚███╔███╔╝",
  "   ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝"
];

const gradientAscii = gradientString(asciiArt);

export default function Header({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return e(
    Box,
    { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 12 },
    e(Text, null, ''),
    e(Text, null, gradientAscii),
    e(Text, null, ''),
    e(Text, { color: 'gray' }, '              map your codebase. navigate with clarity.'),
    e(Text, { color: 'gray' }, `                         v${version}  •  by ${author}`),
    e(Text, null, '')
  );
}
