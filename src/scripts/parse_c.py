#!/usr/bin/env python3
"""
Parses a C/C++ file using heuristic regular expressions and outputs JSON to stdout.
Usage: python3 parse_c.py <filepath>
"""

import re
import json
import sys
import os

def parse_file(filepath):
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        source = f.read()

    lines = source.split('\n')
    
    functions = []
    imports = []
    exports = []
    
    # ── Imports ──────────────────────────────────────────────
    # #include <stdio.h> or #include "file.h"
    import_pattern = re.compile(r'^#\s*include\s*([<"])([^>"]+)[>"]')
    
    # ── Functions ────────────────────────────────────────────
    # Matches: type name(args) { ... }
    # Very basic heuristic: start of line (or after spaces), word/stars, word, parentheses
    fn_pattern = re.compile(r'^\s*(?:[a-zA-Z_]\w*(?:\s+|\s*\*+\s*|\s*&\s*)+)+([a-zA-Z_]\w*)\s*\([^)]*\)\s*\{?', re.MULTILINE)

    for i, line in enumerate(lines):
        line_num = i + 1
        imp_match = import_pattern.match(line.strip())
        if imp_match:
            from_name = imp_match.group(2)
            imports.append({"from": from_name, "names": [from_name]})

    # To find functions, we iterate over matches in the entire source
    for match in fn_pattern.finditer(source):
        # Determine the line number from the match position
        start_index = match.start()
        line_num = source.count('\n', 0, start_index) + 1
        
        name = match.group(1)
        # Exclude common keywords that might look like functions
        if name not in ['if', 'while', 'for', 'switch', 'catch', 'return']:
            functions.append({"name": name, "line": line_num})

    # ── Exports ──────────────────────────────────────────────
    # Heuristic for exports: if there's a corresponding .h file, 
    # we assume non-static functions are exported. We don't have the header content here, 
    # so we just return everything that is NOT marked static.
    for m in fn_pattern.finditer(source):
        full_match = m.group(0).strip()
        name = m.group(1)
        if name not in ['if', 'while', 'for', 'switch', 'catch', 'return']:
            if not full_match.startswith('static'):
                exports.append(name)

    # Dedup exports
    exports = list(dict.fromkeys(exports))

    return {"functions": functions, "imports": imports, "exports": exports}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    filepath = sys.argv[1]
    try:
        result = parse_file(filepath)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
