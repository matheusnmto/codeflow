#!/usr/bin/env node

import { resolve } from 'node:path';
import { stat } from 'node:fs/promises';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { scan } from './scanner.js';
import { buildGraph } from './graph.js';
import { checkDependencies } from './detector.js';

const program = new Command();

program
  .name('codeflow')
  .description('Analisa projetos JS/TS/Python/Go: extrai funções, imports, exports e monta um grafo de dependências.')
  .version('1.0.0')
  .argument('<path>', 'Caminho para um arquivo ou diretório a ser analisado')
  .option('--no-ui', 'Usar output estático (sem interface interativa)')
  .action(async (targetPath, options) => {
    const absolutePath = resolve(targetPath);

    // Validate path exists
    try {
      await stat(absolutePath);
    } catch {
      console.error(chalk.red(`\n  ✗ Caminho não encontrado: ${targetPath}\n`));
      process.exit(1);
    }

    const spinner = ora({
      text: 'Analisando arquivos...',
      color: 'cyan',
    }).start();

    try {
      // 1. Scan for files
      const allFiles = await scan(absolutePath);

      if (allFiles.length === 0) {
        spinner.warn('Nenhum arquivo suportado encontrado no caminho especificado.');
        process.exit(0);
      }

      // 2. Check external binary dependencies
      spinner.stop();
      const { filtered: files } = checkDependencies(allFiles);
      spinner.start();

      spinner.text = `Parseando ${files.length} arquivo(s)...`;

      // 3. Build the graph
      const { graph, errors, stats } = await buildGraph(absolutePath, files);

      // 4. Stop spinner
      spinner.succeed(`Análise concluída — ${stats.files} arquivo(s) processado(s).`);

      // 5. Render output
      if (options.ui === false) {
        // Static fallback (Phase 1 printer)
        const { printGraph } = await import('./printer.js');
        printGraph(graph, stats, errors);
      } else {
        // Interactive Ink UI
        const React = await import('react');
        const { render } = await import('ink');
        const { default: App } = await import('./ui/App.js');

        render(React.createElement(App, { graph, stats, errors }));
      }
    } catch (err) {
      spinner.fail('Erro durante a análise.');
      console.error(chalk.red(err.message));
      process.exit(1);
    }
  });

program.parse();
