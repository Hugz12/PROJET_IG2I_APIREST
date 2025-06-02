import { build } from 'esbuild';

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  platform: 'node', // ou 'browser'
  format: 'cjs',
  sourcemap: true,
  target: ['node20'],
  minify: true,
  tsconfig: 'tsconfig.json',
}).catch(() => process.exit(1));