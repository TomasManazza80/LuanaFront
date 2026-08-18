import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: '/',

  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null;

        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
    react(),
    tailwindcss(),
  ],

  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
      loader: {
        '.js': 'jsx',
      },
    },
  },

  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
      external: ['fs', 'child_process', 'tty'], // solo los que no tienen polyfill
    },
    target: 'es2020',
    sourcemap: true,
    manifest: true,
    polyfillDynamicImport: true,
    chunkFilename: 'chunks/[name].js',
    onwarn: (warning) => {
      if (warning.code === 'MISSING_FILE') return;
      console.warn(warning);
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      http: 'rollup-plugin-node-polyfills/polyfills/http',
      https: 'rollup-plugin-node-polyfills/polyfills/https',
    },
    mainFields: ['browser', 'module', 'main'],
  },
});
