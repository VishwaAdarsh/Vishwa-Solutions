/**
 * Production build script for Vishwa Solutions
 * Minifies CSS and JavaScript assets using esbuild
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Vishwa Solutions assets...');

try {
  // 1. Minify CSS
  execSync('npx esbuild styles/main.css --minify --outfile=styles/main.min.css', { stdio: 'inherit' });
  
  // 2. Minify JS
  execSync('npx esbuild scripts/main.js --minify --outfile=scripts/main.min.js', { stdio: 'inherit' });

  console.log('✓ Build complete: styles/main.min.css and scripts/main.min.js updated.');
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}
