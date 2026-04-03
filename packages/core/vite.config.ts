import { resolve } from 'path';
import { createViteConfig } from '../shared-vite.config';

export default createViteConfig({
  name: 'unzer-core',
  umdName: 'UnzerCore',
  entry: resolve(__dirname, 'src/index.ts'),
  rootDir: resolve(__dirname, '../..'),
  external: [],
});
