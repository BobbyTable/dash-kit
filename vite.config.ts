// Two builds from src/:
//   vite build                → dist/*.js  ES modules, one per entry (bundlers: Angular, Vite, Next — tree-shakeable)
//   vite build --mode global  → dist/dash-kit.global.js  one classic script, window.DashKit (plain pages without a bundler)
// Types come from tsc (dist/types), run last: the first build empties dist/. npm run build does all three.
import { defineConfig } from 'vite';

const ENTRIES = ['index', 'format', 'tooltip', 'icons', 'markup', 'chart', 'bars', 'copy'];

export default defineConfig(({ mode }) => mode === 'global'
  ? { build: { emptyOutDir: false, minify: false, sourcemap: true,
      lib: { entry: 'src/index.ts', name: 'DashKit', formats: ['iife'], fileName: () => 'dash-kit.global.js' } } }
  : { build: { emptyOutDir: true, minify: false, sourcemap: true,
      lib: { entry: Object.fromEntries(ENTRIES.map(e => [e, `src/${e}.ts`])), formats: ['es'], fileName: (_f, name) => `${name}.js` } } });
