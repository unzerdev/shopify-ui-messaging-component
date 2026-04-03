#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mode = process.argv[2] || 'development';
const cssMode = process.argv[3] || 'separate'; // 'separate' ili 'inline'

// Set environment variables
const env = {
  ...process.env,
  BUILD_MODE: mode,
  CSS_MODE: cssMode,
  NODE_ENV: mode === 'production' ? 'production' : 'development'
};

console.log(`🔨 Building in ${mode} mode...`);
console.log(`📦 Build mode: ${env.BUILD_MODE}`);
console.log(`🎨 CSS mode: ${env.CSS_MODE}`);
console.log(`🌍 Node env: ${env.NODE_ENV}`);

// Run vite build with environment
const vite = spawn('npx', ['vite', 'build'], {
  env,
  stdio: 'inherit',
  shell: true
});

vite.on('close', (code) => {
  if (code === 0) {
    console.log(`✅ Build completed successfully!`);
    
    // Show what was built
    console.log('\n📁 Built files:');
    if (mode === 'production') {
      console.log('  - unzer-components.min.es.js (minified ES module)');
      console.log('  - unzer-components.min.umd.js (minified UMD)');
      if (cssMode === 'separate') {
        console.log('  - unzer-components.min.css (minified styles - separate file)');
      } else {
        console.log('  - CSS included inline in JS files');
      }
    } else {
      console.log('  - unzer-components.es.js (ES module with sourcemaps)');
      console.log('  - unzer-components.umd.js (UMD with sourcemaps)');
      if (cssMode === 'separate') {
        console.log('  - unzer-components.css (unminified styles - separate file)');
      } else {
        console.log('  - CSS included inline in JS files');
      }
    }
  } else {
    console.error(`❌ Build failed with code ${code}`);
    process.exit(code);
  }
});