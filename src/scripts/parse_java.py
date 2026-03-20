#!/usr/bin/env python3
"""
Parses a Java file using heuristic regular expressions and outputs JSON to stdout.
Usage: python3 parse_java.py <filepath>
"""

import re
import json
import sys

def parse_file(filepath):
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        source = f.read()

    lines = source.split('\n')
    
    functions = []
    imports = []
    exports = []
    
    # ── Imports ──────────────────────────────────────────────
    # import java.util.List;
    import_pattern = re.compile(r'^\s*import\s+(static\s+)?([\w\.]+);')
    
    # ── Functions (Methods) ──────────────────────────────────
    # Matches: public static void main(String[] args)
    # Looking for a visibility modifier, optional modifiers, return type, name, params
    fn_pattern = re.compile(r'^\s*(public|protected|private)?\s*(?:static\s+|final\s+|abstract\s+|synchronized\s+)*([\w\<\>\[\]]+)\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*(?:throws\s+[\w\s,]+)?\{?', re.MULTILINE)

    for i, line in enumerate(lines):
        line_num = i + 1
        imp_match = import_pattern.match(line.strip())
        if imp_match:
            full_path = imp_match.group(2)
            parts = full_path.split('.')
            name = parts[-1]
            imports.append({"from": full_path, "names": [name]})

    for match in fn_pattern.finditer(source):
        start_index = match.start()
        line_num = source.count('\n', 0, start_index) + 1
        
        visibility = match.group(1)
        name = match.group(3)
        
        # Exclude keyword lookalikes
        if name not in ['if', 'while', 'for', 'switch', 'catch', 'return', 'new']:
            functions.append({"name": name, "line": line_num})
            # Export = public methods
            if visibility == 'public':
                exports.append(name)

    # Add class constructors as functions and exports if public
    class_pattern = re.compile(r'^\s*(public|protected|private)?\s*(?:abstract\s+|final\s+)?class\s+([a-zA-Z_]\w*)', re.MULTILINE)
    for class_match in class_pattern.finditer(source):
        class_name = class_match.group(2)
        
        # Find constructor pattern
        ctor_pattern = re.compile(r'^\s*(public|protected|private)?\s*' + class_name + r'\s*\([^)]*\)\s*\{', re.MULTILINE)
        for ctor_match in ctor_pattern.finditer(source):
            start_index = ctor_match.start()
            line_num = source.count('\n', 0, start_index) + 1
            visibility = ctor_match.group(1)
            functions.append({"name": class_name, "line": line_num})
            if visibility == 'public':
                exports.append(class_name)

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
