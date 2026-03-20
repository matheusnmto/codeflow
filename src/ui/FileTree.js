import React from 'react';
import { Box } from 'ink';
import FileNode from './FileNode.js';

const e = React.createElement;

/**
 * FileTree — renders the navigable list of file nodes.
 */
export default function FileTree({ entries, selectedIndex, expandedSet }) {
  return e(
    Box,
    { flexDirection: 'column', paddingTop: 1 },
    ...entries.map(([file, data], i) =>
      e(FileNode, {
        key: file,
        file,
        data,
        isSelected: i === selectedIndex,
        isExpanded: expandedSet.has(i),
      })
    )
  );
}
