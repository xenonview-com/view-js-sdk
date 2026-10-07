import js from '@eslint/js';
import sonarjs from 'eslint-plugin-sonarjs';

const globals = Object.fromEntries([
  'window', 'document', 'navigator', 'crypto', 'sessionStorage', 'localStorage',
  'self', 'XMLHttpRequest', 'URLSearchParams', 'console', 'global', 'require', 'module',
  '__dirname', 'describe', 'it', 'expect', 'expectAsync', 'beforeEach', 'afterEach',
  'beforeAll', 'afterAll', 'jasmine', 'setTimeout', 'clearTimeout', 'URL', 'fetch'
].map(name => [name, 'readonly']));

export default [
  {ignores: ['node_modules/**', 'dist/**', 'coverage/**']},
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {globals},
    plugins: {sonarjs},
    rules: {
      'sonarjs/cognitive-complexity': ['error', 1],
      'no-unused-vars': ['error', {args: 'none'}]
    }
  }
];
