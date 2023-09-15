import { defineConfig } from 'tsup';

/* eslint-disable-next-line import/no-default-export */
export default defineConfig({
  clean: true,
  silent: true,
  dts: false,
  entry: ['src/**/*.ts', '!src/**/*.d.ts', 'config/**/*.ts'],
  format: ['esm'],
  minify: false,
  skipNodeModulesBundle: true,
  sourcemap: true,
  target: 'esnext',
  tsconfig: 'tsconfig.json',
  bundle: false,
  shims: false,
  keepNames: true,
  splitting: false,
});
