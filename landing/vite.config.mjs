import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    input: {
        main: resolve(import.meta.dirname, 'index.html'),
        ru: resolve(import.meta.dirname, 'ru/index.html'),
    },
});
