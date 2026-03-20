import chalk from 'chalk';

/**
 * Print the parsed graph to the terminal with colors.
 * @param {Record<string, { functions: {name: string, line: number}[], imports: {from: string, names: string[]}[], exports: string[] }>} graph
 * @param {{ files: number, functions: number, connections: number }} stats
 * @param {string[]} errors
 */
export function printGraph(graph, stats, errors) {
  const entries = Object.entries(graph);

  for (const [file, data] of entries) {
    console.log();
    console.log(chalk.cyan.bold(file));

    // Functions
    for (const fn of data.functions) {
      const name = fn.name.padEnd(18);
      console.log(`  ${chalk.blue('ƒ')} ${chalk.white(name)} ${chalk.gray(`(linha ${fn.line})`)}`);
    }

    // Imports
    for (const imp of data.imports) {
      const names = imp.names.join(', ');
      console.log(`  ${chalk.yellow('↓')} ${chalk.yellow('imports:')}  ${chalk.white(imp.from)} → ${chalk.yellow(names)}`);
    }

    // Exports
    if (data.exports.length > 0) {
      console.log(`  ${chalk.green('↑')} ${chalk.green('exports:')}  ${chalk.white(data.exports.join(', '))}`);
    }
  }

  // Errors
  if (errors.length > 0) {
    console.log();
    console.log(chalk.red.bold('⚠  Arquivos com erro de parse:'));
    for (const e of errors) {
      console.log(`  ${chalk.red('✗')} ${e}`);
    }
  }

  // Summary
  console.log();
  console.log(chalk.gray('─'.repeat(35)));
  console.log(chalk.white(`  ${chalk.bold(stats.files)} arquivos analisados`));
  console.log(chalk.white(`  ${chalk.bold(stats.functions)} funções mapeadas`));
  console.log(chalk.white(`  ${chalk.bold(stats.connections)} conexões entre módulos`));
  console.log(chalk.gray('─'.repeat(35)));
  console.log();
}
