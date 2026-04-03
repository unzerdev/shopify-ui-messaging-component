/**
 * Shared Vite build configuration factory.
 * Used by all package vite.config.ts files for consistent dev/prod builds.
 */
import { defineConfig, type UserConfig } from 'vite';
import { resolve } from 'path';

const isProd = process.env.BUILD_MODE === 'production';

interface PackageBuildOptions {
  /** Package name for file output (e.g. 'unzer-core') */
  name: string;
  /** UMD global variable name (e.g. 'UnzerCore') */
  umdName: string;
  /** Absolute path to entry file */
  entry: string;
  /** Absolute path to the project root (for outputting to root/dist) */
  rootDir: string;
  /** External dependencies (package names) — empty for self-contained bundles */
  external?: string[];
  /** UMD globals mapping for external deps */
  globals?: Record<string, string>;
  /** Vite resolve.alias config */
  alias?: UserConfig['resolve']['alias'];
}

export function createViteConfig(options: PackageBuildOptions): UserConfig {
  const { name, umdName, entry, rootDir, external = [], globals = {}, alias } = options;

  const suffix = isProd ? '.min' : '';

  return defineConfig({
    build: {
      outDir: resolve(rootDir, 'dist'),
      emptyOutDir: false,
      lib: {
        entry,
        name: umdName,
        fileName: (format) => `${name}${suffix}.${format}.js`,
      },
      rollupOptions: {
        external,
        output: [
          {
            format: 'es',
            entryFileNames: `${name}${suffix}.es.js`,
          },
          {
            format: 'umd',
            name: umdName,
            entryFileNames: `${name}${suffix}.umd.js`,
            globals,
          },
        ],
      },
      sourcemap: true,
      cssCodeSplit: false,
      minify: isProd ? 'esbuild' : false,
      reportCompressedSize: isProd,
      target: isProd ? 'es2020' : 'esnext',
    },
    esbuild: isProd
      ? {
          drop: ['console', 'debugger'],
        }
      : undefined,
    resolve: alias ? { alias } : undefined,
  }) as UserConfig;
}
