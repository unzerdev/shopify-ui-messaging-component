import { resolve } from 'path';
import { createViteConfig } from '../shared-vite.config';

export default createViteConfig({
  name: 'unzer-invoice',
  umdName: 'UnzerInvoice',
  entry: resolve(__dirname, 'src/index.ts'),
  rootDir: resolve(__dirname, '../..'),
  external: ['@unzer/messaging-core'],
  globals: { '@unzer/messaging-core': 'UnzerCore' },
  alias: [
    { find: /^@unzer\/messaging-core$/, replacement: resolve(__dirname, '../core/src/index.ts') },
    { find: /^@unzer\/messaging-core\//, replacement: resolve(__dirname, '../core') + '/' },
  ],
});
