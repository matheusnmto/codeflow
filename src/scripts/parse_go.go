// parse_go.go
// Parses a Go file using go/ast and outputs JSON to stdout.
// Usage: go run parse_go.go <filepath>

package main

import (
	"encoding/json"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"strings"
	"unicode"
)

type Function struct {
	Name string `json:"name"`
	Line int    `json:"line"`
}

type Import struct {
	From  string   `json:"from"`
	Names []string `json:"names"`
}

type Result struct {
	Functions []Function `json:"functions"`
	Imports   []Import   `json:"imports"`
	Exports   []string   `json:"exports"`
}

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "Usage: go run parse_go.go <filepath>\n")
		os.Exit(1)
	}

	filepath := os.Args[1]
	fset := token.NewFileSet()

	node, err := parser.ParseFile(fset, filepath, nil, parser.AllErrors)
	if err != nil {
		errResult, _ := json.Marshal(map[string]string{"error": err.Error()})
		fmt.Println(string(errResult))
		os.Exit(1)
	}

	result := Result{
		Functions: []Function{},
		Imports:   []Import{},
		Exports:   []string{},
	}

	// ── Functions ──────────────────────────────────────────
	for _, decl := range node.Decls {
		fn, ok := decl.(*ast.FuncDecl)
		if !ok {
			continue
		}

		name := fn.Name.Name
		line := fset.Position(fn.Pos()).Line

		result.Functions = append(result.Functions, Function{Name: name, Line: line})

		// Exported = starts with uppercase letter (Go convention)
		if len(name) > 0 && unicode.IsUpper(rune(name[0])) {
			result.Exports = append(result.Exports, name)
		}
	}

	// ── Imports ───────────────────────────────────────────
	for _, imp := range node.Imports {
		path := strings.Trim(imp.Path.Value, "\"")

		// Use alias if present, otherwise last segment of path
		var name string
		if imp.Name != nil {
			name = imp.Name.Name
		} else {
			parts := strings.Split(path, "/")
			name = parts[len(parts)-1]
		}

		result.Imports = append(result.Imports, Import{
			From:  path,
			Names: []string{name},
		})
	}

	output, _ := json.Marshal(result)
	fmt.Println(string(output))
}
