import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      formats: ['es', 'cjs'],
      entry: path.resolve(__dirname, 'index.ts'),
      fileName: format => format === 'cjs' ? 'index.cjs' : 'index.js',
    },
    outDir: 'dist',
    minify: false,
    rollupOptions: {
      external: [
        'markedit-api',
        '@codemirror/view',
        '@codemirror/state',
        '@codemirror/language',
        '@codemirror/commands',
        '@codemirror/search',
        '@lezer/common',
        '@lezer/highlight',
        '@lezer/markdown',
        '@lezer/lr',
      ],
    },
  },
});
