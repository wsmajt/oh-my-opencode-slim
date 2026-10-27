import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export async function buildTui(outputFile = 'dist/tui2.js'): Promise<void> {
  const outputPath = resolve(outputFile);
  const result = await Bun.build({
    entrypoints: ['src/v2/tui.ts'],
    outfile: outputPath,
    target: 'node',
    format: 'esm',
    external: [
      '@opencode-ai/plugin',
      '@opencode-ai/plugin/tui',
      '@opencode-ai/sdk',
      '@opencode-ai/sdk/v2',
      '@opentui/core',
      '@opentui/solid',
      'solid-js',
      'jsdom',
    ],
    plugins: [
      {
        name: 'jsonc-parser-esm',
        setup(build) {
          build.onResolve({ filter: /^jsonc-parser$/ }, () => ({
            path: resolve(import.meta.dir, '../node_modules/jsonc-parser/lib/esm/main.js'),
          }));
        },
      },
    ],
  });

  if (!result.success) {
    for (const log of result.logs) console.error(log);
    throw new Error('TUI build failed');
  }
  if (result.outputs.length !== 1) {
    throw new Error(`Expected one TUI build output, got ${result.outputs.length}`);
  }

  const [output] = result.outputs;
  if (!output) throw new Error('TUI build output is missing');
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, Buffer.from(await output.arrayBuffer()));

  const artifact = statSync(outputPath);
  if (!artifact.isFile() || artifact.size === 0) {
    throw new Error(`TUI build artifact is missing or empty: ${outputPath}`);
  }
}

if (import.meta.main) {
  try {
    await buildTui();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
