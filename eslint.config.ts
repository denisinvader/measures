import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, includeIgnoreFile } from 'eslint/config';

const gitIgnoreRoot = fileURLToPath(new URL('.gitignore', import.meta.url));
const gitIgnoreExtension = fileURLToPath(new URL('extension/.gitignore', import.meta.url));

export default defineConfig([
    includeIgnoreFile([gitIgnoreRoot, gitIgnoreExtension], { gitignoreResolution: true }),
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        plugins: { js },
        extends: ['js/recommended'],
        languageOptions: { globals: globals.browser },
    },
    tseslint.configs.recommended,
]);
