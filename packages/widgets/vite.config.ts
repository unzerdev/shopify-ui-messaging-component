import { resolve } from 'path';
import { createViteConfig } from '../shared-vite.config';

export default createViteConfig({
  name: 'unzer-widgets',
  umdName: 'UnzerWidgets',
  entry: resolve(__dirname, 'src/index.ts'),
  rootDir: resolve(__dirname, '../..'),
  external: [],  // Self-contained — bundles everything
  alias: [
    { find: /^@unzer\/messaging-core$/, replacement: resolve(__dirname, '../core/src/index.ts') },
    { find: /^@unzer\/messaging-core\//, replacement: resolve(__dirname, '../core') + '/' },
    { find: /^@unzer\/messaging-installments$/, replacement: resolve(__dirname, '../installments/src/index.ts') },
    { find: /^@unzer\/messaging-invoice$/, replacement: resolve(__dirname, '../invoice/src/index.ts') },
  ],
});
