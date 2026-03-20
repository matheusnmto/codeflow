
`codeflow` is an interactive CLI tool that parses your project, extracts all functions, imports and exports, and renders a navigable dependency map directly in the terminal — with colors and keyboard navigation.

---

## Installation
```bash
npm install -g @matheusnmto/codeflow
```

| Dependency | Required | Used for |
|---|---|---|
| Node.js 18+ | Required | Core runtime |
| python3 | Optional | Python, C/C++, Java parsing |
| go | Optional | Go parsing |

---

## Usage
```bash
# Analyze current directory
codeflow .

# Analyze a specific folder
codeflow ./src

# Output without interactive UI
codeflow ./src --no-ui
```

---

## Navigation

| Key | Action |
|---|---|
| `↑` `↓` or `j` `k` | Move between files |
| `Enter` or `Space` | Expand / collapse |
| `/` | Search |
| `Escape` | Close search |
| `q` | Quit |

---

## Supported Languages

| Language | Extensions | Parser |
|---|---|---|
| JavaScript | `.js` `.jsx` | Babel AST |
| TypeScript | `.ts` `.tsx` | Babel AST |
| Python | `.py` | ast (stdlib) |
| Go | `.go` | go/ast (stdlib) |
| C / C++ | `.c` `.cpp` `.h` `.hpp` | Regex heuristic |
| Java | `.java` | Regex heuristic |

---

## Stack

- **[Ink](https://github.com/vadimdemedes/ink)** — React-powered terminal UI
- **[@babel/parser](https://babeljs.io/docs/babel-parser)** — JS/TS AST parsing
- **[Chalk](https://github.com/chalk/chalk)** — terminal colors
- **[Commander](https://github.com/tj/commander.js)** — CLI interface

---
