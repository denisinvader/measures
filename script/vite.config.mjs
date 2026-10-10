import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    input: resolve(import.meta.dirname, 'index.ts'),
    build: {
        rollupOptions: {
            output: {
                entryFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
    },
});
