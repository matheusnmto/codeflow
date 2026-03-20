import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import chalk from 'chalk';
import FileNode from './FileNode.js';

const e = React.createElement;

/**
 * Highlights a search query within a text.
 */
function highlightText(text, query) {
  if (!query) return chalk.white(text);
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return chalk.white(text);

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return chalk.white(before) + chalk.yellow.bold(match) + chalk.white(after);
}

/**
 * Search — overlay that filters graph entries by function name or file path.
 * Dual panel: Left (Results) | Right (Preview)
 */
export default function Search({ query, onQueryChange, entries, onSelect, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter entries matching query
  const results = [];
  if (query.trim().length > 0) {
    const q = query.toLowerCase();
    for (const [file, data] of entries) {
      const fileMatch = file.toLowerCase().includes(q);

      // Match functions
      for (const fn of data.functions) {
        if (fileMatch || fn.name.toLowerCase().includes(q)) {
          results.push({ type: 'func', file, data, name: fn.name, line: fn.line });
        }
      }

      // Check import matches
      for (const imp of data.imports) {
        if (!fileMatch && imp.from.toLowerCase().includes(q)) {
          results.push({ type: 'import', file, data, name: imp.from, line: 0 });
        }
      }

      // Check export matches
      for (const exp of data.exports) {
        if (!fileMatch && exp.toLowerCase().includes(q)) {
          results.push({ type: 'export', file, data, name: exp, line: 0 });
        }
      }

      // If the file matched but no functions did, still show the file
      if (fileMatch && data.functions.length === 0) {
        results.push({ type: 'file', file, data, name: '', line: 0 });
      }
    }
  }

  // Cap results and ensure selected index is valid
  const displayResults = results.slice(0, 15);
  useEffect(() => {
    if (selectedIndex >= displayResults.length) {
      setSelectedIndex(Math.max(0, displayResults.length - 1));
    }
  }, [displayResults.length, selectedIndex]);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => Math.min(displayResults.length - 1, prev + 1));
    } else if (key.return) {
      if (displayResults.length > 0) {
        const selected = displayResults[selectedIndex];
        // Send back the selected file to select and expand it in the main tree
        onSelect(selected.file);
      }
    } else if (key.escape) {
      onClose();
    }
  });

  const selectedEntry = displayResults[selectedIndex];

  // ── Left Panel: Results ─────────────────────────────────────
  const leftPanel = e(
    Box,
    { flexDirection: 'column', width: '50%', paddingRight: 2, borderRight: true, borderStyle: 'single', borderColor: 'gray' },
    e(Text, { color: 'cyan', bold: true }, '  Resultados'),
    e(Text, null, ''),
    displayResults.length > 0
      ? displayResults.map((r, i) => {
        const isSelected = i === selectedIndex;
        const prefix = isSelected ? chalk.cyan('  ❯') : '   ';
        const fileName = r.file;
        const funcPart = r.type === 'func'
          ? ` ${chalk.blue('ƒ')} ${highlightText(r.name, query)}  ${chalk.gray(`linha ${r.line}`)}`
          : '';

        return e(
          Text,
          { key: `${r.file}-${r.name}-${i}` },
          `${prefix} ${highlightText(fileName, query)}${funcPart}`
        );
      })
      : e(Text, { color: 'gray' }, '  Nenhum resultado encontrado.')
  );

  // ── Right Panel: Preview ────────────────────────────────────
  const rightPanel = e(
    Box,
    { flexDirection: 'column', width: '50%', paddingLeft: 2 },
    e(Text, { color: 'cyan', bold: true }, '  Preview'),
    e(Text, null, ''),
    selectedEntry
      ? e(FileNode, {
        file: selectedEntry.file,
        data: selectedEntry.data,
        isSelected: false,
        isExpanded: true // Always expanded in preview
      })
      : e(Text, { color: 'gray' }, '  Selecione um resultado para ver o preview.')
  );

  return e(
    Box,
    { flexDirection: 'column', paddingTop: 1, paddingBottom: 1 },
    // Search input row
    e(
      Box,
      { paddingBottom: 1 },
      e(Text, { color: 'yellow' }, '  🔍 buscar: '),
      e(TextInput, { value: query, onChange: onQueryChange })
    ),
    // Panels
    e(
      Box,
      { flexDirection: 'row' },
      leftPanel,
      rightPanel
    )
  );
}
