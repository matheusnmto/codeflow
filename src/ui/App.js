import React, { useState, useCallback } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import FileTree from './FileTree.js';
import Search from './Search.js';
import Header from './Header.js';

const e = React.createElement;

/**
 * App — root Ink component.
 * Manages: selectedIndex, expandedSet, searchMode, searchQuery, and intro header.
 */
export default function App({ graph, stats, errors }) {
  const { exit } = useApp();
  const entries = Object.entries(graph);

  const [showIntro, setShowIntro] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedSet, setExpandedSet] = useState(new Set());
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpanded = useCallback((index) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleSearchSelect = useCallback((selectedFile) => {
    const fileIndex = entries.findIndex(([f]) => f === selectedFile);
    if (fileIndex !== -1) {
      setSelectedIndex(fileIndex);
      setExpandedSet((prev) => new Set(prev).add(fileIndex));
    }
    setSearchMode(false);
    setSearchQuery('');
  }, [entries]);

  const handleSearchClose = useCallback(() => {
    setSearchMode(false);
    setSearchQuery('');
  }, []);

  useInput((input, key) => {
    if (showIntro) return; // Ignore input during header
    if (searchMode) return; // Search.js handles its own inputs

    // Navigation
    if (key.upArrow || input === 'k') {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex((prev) => Math.min(entries.length - 1, prev + 1));
    }

    // Toggle expand/collapse
    else if (key.return || input === ' ') {
      toggleExpanded(selectedIndex);
    }

    // Open search
    else if (input === '/') {
      setSearchMode(true);
      setSearchQuery('');
    }

    // Quit
    else if (input === 'q') {
      exit();
    }
  });

  if (showIntro) {
    return e(Header, { onDone: () => setShowIntro(false) });
  }

  // ── Header ────────────────────────────────────────────────
  const header = e(
    Box,
    { paddingLeft: 2 },
    e(Text, { bold: true, color: 'cyanBright' }, 'codeflow'),
    e(Text, { color: 'gray' }, ' — mapa de dependências          '),
    e(Text, { color: 'gray' }, '['),
    e(Text, { color: 'yellow' }, '/'),
    e(Text, { color: 'gray' }, '] buscar  ['),
    e(Text, { color: 'red' }, 'q'),
    e(Text, { color: 'gray' }, '] sair'),
  );

  // ── Footer ────────────────────────────────────────────────
  const footer = e(
    Box,
    { paddingLeft: 2, paddingTop: 1 },
    e(Text, { color: 'gray' },
      `${stats.files} arquivos  │  ${stats.functions} funções  │  ${stats.connections} conexões`
    ),
  );

  // ── Error list (if any) ───────────────────────────────────
  const errorBlock = errors.length > 0
    ? e(
        Box,
        { flexDirection: 'column', paddingLeft: 2, paddingTop: 1 },
        e(Text, { color: 'red', bold: true }, '⚠  Arquivos com erro de parse:'),
        ...errors.map((err) => e(Text, { key: err, color: 'red' }, `  ✗ ${err}`))
      )
    : null;

  // ── Layout ────────────────────────────────────────────────
  return e(
    Box,
    { flexDirection: 'column' },
    header,
    searchMode
      ? e(Search, {
          query: searchQuery,
          onQueryChange: setSearchQuery,
          entries,
          onSelect: handleSearchSelect,
          onClose: handleSearchClose,
        })
      : e(FileTree, {
          entries,
          selectedIndex,
          expandedSet,
        }),
    errorBlock,
    footer,
  );
}
