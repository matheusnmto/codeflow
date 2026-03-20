import { execSync } from 'node:child_process';
import chalk from 'chalk';

/**
 * Check if required external binaries are available.
 * Returns which languages are supported and filters out unsupported files.
 *
 * @param {string[]} files — array of absolute file paths
 * @returns {{ available: { python: boolean, go: boolean }, filtered: string[] }}
 */
export function checkDependencies(files) {
  const hasPython = files.some((f) => f.endsWith('.py') || f.endsWith('.c') || f.endsWith('.cpp') || f.endsWith('.h') || f.endsWith('.hpp') || f.endsWith('.java'));
  const hasGo = files.some((f) => f.endsWith('.go'));

  const available = { python: true, go: true };

  if (hasPython) {
    try {
      execSync('python3 --version', { stdio: 'ignore' });
    } catch {
      available.python = false;
      console.warn(chalk.yellow('  ⚠ python3 não encontrado — arquivos .py, C/C++ e Java serão ignorados'));
    }
  }

  if (hasGo) {
    try {
      execSync('go version', { stdio: 'ignore' });
    } catch {
      available.go = false;
      console.warn(chalk.yellow('  ⚠ go não encontrado — arquivos .go serão ignorados'));
    }
  }

  // Filter out files whose runtime is unavailable
  const filtered = files.filter((f) => {
    const isPyCJava = f.endsWith('.py') || f.endsWith('.c') || f.endsWith('.cpp') || f.endsWith('.h') || f.endsWith('.hpp') || f.endsWith('.java');
    if (isPyCJava && !available.python) return false;
    if (f.endsWith('.go') && !available.go) return false;
    return true;
  });

  return { available, filtered };
}
