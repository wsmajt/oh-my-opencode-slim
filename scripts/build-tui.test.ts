import { afterEach, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildTui } from './build-tui';

const tempDirs: string[] = [];

afterEach(() => {
  for (const directory of tempDirs.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('writes the ESM JSONC bundle when the output artifact is absent', async () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'omo-tui-build-'));
  tempDirs.push(tempDir);
  const outputFile = join(tempDir, 'dist', 'tui2.js');

  expect(() => readFileSync(outputFile)).toThrow();
  await buildTui(outputFile);

  const artifact = readFileSync(outputFile, 'utf8');
  expect(artifact).toContain('jsonc-parser/lib/esm/main.js');
  expect(artifact).not.toContain('from "jsonc-parser"');
  expect(artifact).not.toContain('jsonc-parser/lib/umd/main.js');
});
