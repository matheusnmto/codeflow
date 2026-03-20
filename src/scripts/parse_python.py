#!/usr/bin/env python3
"""
Parses a Python file using the ast module and outputs JSON to stdout.
Usage: python3 parse_python.py <filepath>

Output format:
{
  "functions": [{"name": "foo", "line": 5}],
  "imports": [{"from": "os", "names": ["path"]}],
  "exports": []
}
"""

import ast
import json
import sys


def parse_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        source = f.read()

    tree = ast.parse(source, filename=filepath)

    functions = []
    imports = []
    exports = []
    has_main_guard = False

    for node in ast.walk(tree):
        # ── Functions ──────────────────────────────────────────
        if isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef):
            functions.append({"name": node.name, "line": node.lineno})

        # ── Imports ────────────────────────────────────────────
        elif isinstance(node, ast.Import):
            for alias in node.names:
                imports.append({
                    "from": alias.name,
                    "names": [alias.asname if alias.asname else alias.name]
                })

        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            names = []
            for alias in node.names:
                names.append(alias.asname if alias.asname else alias.name)
            imports.append({"from": module, "names": names})

        # ── Detect if __name__ == "__main__" ───────────────────
        elif isinstance(node, ast.If):
            try:
                test = node.test
                if (
                    isinstance(test, ast.Compare)
                    and isinstance(test.left, ast.Name)
                    and test.left.id == "__name__"
                    and len(test.comparators) == 1
                    and isinstance(test.comparators[0], ast.Constant)
                    and test.comparators[0].value == "__main__"
                ):
                    has_main_guard = True
            except Exception:
                pass

    if has_main_guard:
        exports.append("__main__")

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
