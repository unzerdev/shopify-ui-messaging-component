import { defineConfig, defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync, unlinkSync } from 'fs';

// Check if we're building for production
const buildMode = process.env.BUILD_MODE || 'development';
const cssMode = process.env.CSS_MODE || 'separate'; // 'separate' ili 'inline'

export default defineConfig(({ mode }) => ({
  plugins: [
    {
      name: 'html-404',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.endsWith('.html') && req.url !== '/') {
            const filePath = resolve(__dirname, 'public' + req.url);
            const rootFilePath = resolve(__dirname, req.url.slice(1));
            
            if (!existsSync(filePath) && !existsSync(rootFilePath)) {
              res.statusCode = 404;
              res.end('File not found');
              return;
            }
          }
          next();
        });
      }
    },
    // Plugin to suppress CSS output when in inline mode
    cssMode === 'inline' ? {
      name: 'suppress-css-output',
      writeBundle(options, bundle) {
        // Remove CSS files after they are written when inline mode is enabled
        Object.keys(bundle).forEach(fileName => {
          if (fileName.endsWith('.css')) {
            const filePath = resolve(options.dir || 'dist', fileName);
            try {
              if (existsSync(filePath)) {
                unlinkSync(filePath);
                console.log(`🗑️  Removed CSS file: ${fileName} (inline mode)`);
              }
            } catch (error) {
              console.warn(`Failed to remove CSS file ${fileName}:`, error.message);
            }
          }
        });
      }
    } : null
  ].filter(Boolean),
  build: {
    lib: {
      entry: resolve(__dirname, 'dev-entry.ts'),
      name: 'UnzerMessaging',
      fileName: (format) => {
        const suffix = buildMode === 'production' ? '.min' : '';
        return `unzer-messaging${suffix}.${format}.js`;
      }
    },
    rollupOptions: {
      // Explicitly include all dependencies
      external: [],
      output: [
        // ES Module build
        {
          format: 'es',
          entryFileNames: buildMode === 'production' ? 'unzer-messaging.min.es.js' : 'unzer-messaging.es.js',
          assetFileNames: buildMode === 'production' ? 'unzer-messaging.min.[ext]' : 'unzer-messaging.[ext]',
        },
        // UMD build
        {
          format: 'umd',
          name: 'UnzerMessaging',
          entryFileNames: buildMode === 'production' ? 'unzer-messaging.min.umd.js' : 'unzer-messaging.umd.js',
          assetFileNames: buildMode === 'production' ? 'unzer-messaging.min.[ext]' : 'unzer-messaging.[ext]',
        }
      ]
    },
    sourcemap: true,
    cssCodeSplit: cssMode === 'separate', // true = separate CSS files, false = inline CSS in JS
    minify: buildMode === 'production' ? 'esbuild' : false,
    reportCompressedSize: buildMode === 'production',
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    open: true,
    middlewareMode: false,
    fs: {
      strict: false
    }
  },
  appType: 'spa',
  resolve: {
    alias: [
      { find: /^@unzer\/messaging-core$/, replacement: resolve(__dirname, 'packages/core/src/index.ts') },
      { find: /^@unzer\/messaging-core\//, replacement: resolve(__dirname, 'packages/core') + '/' },
      { find: /^@unzer\/messaging-installments$/, replacement: resolve(__dirname, 'packages/installments/src/index.ts') },
      { find: /^@unzer\/messaging-invoice$/, replacement: resolve(__dirname, 'packages/invoice/src/index.ts') },
      { find: /^@unzer\/messaging-styler$/, replacement: resolve(__dirname, 'packages/styler/src/index.ts') },
    ]
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
}));