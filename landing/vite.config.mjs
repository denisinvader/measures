import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    input: {
        main: resolve(import.meta.dirname, 'index.html'),
        ru: resolve(import.meta.dirname, 'ru/index.html'),
        404: resolve(import.meta.dirname, '404.html'),
        500: resolve(import.meta.dirname, '500.html'),
    },
});
