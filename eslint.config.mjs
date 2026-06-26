import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Node.js core modules. shared must stay isomorphic (Vite / Metro / Node), so it
// may not import any of these (v0.2 §0). Covers both bare specifiers (`fs`) and
// the `node:` protocol form (`node:fs`, `node:fs/promises`).
const NODE_BUILTIN_MODULES = [
  'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console',
  'constants', 'crypto', 'dgram', 'diagnostics_channel', 'dns', 'domain',
  'events', 'fs', 'http', 'http2', 'https', 'inspector', 'module', 'net', 'os',
  'path', 'perf_hooks', 'process', 'punycode', 'querystring', 'readline', 'repl',
  'stream', 'string_decoder', 'sys', 'timers', 'tls', 'trace_events', 'tty',
  'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib',
];

const SHARED_RESTRICTED_IMPORT_PATTERNS = [
  // UI / React red line (PRD §3.4 / §13.1).
  'react', 'react/*', 'react-dom', 'react-dom/*', 'react-native',
  'react-native/*', '@xstate/react', '@xstate/react/*', 'antd', 'antd/*',
  '@ant-design/*',
  // Node-builtin red line (v0.2 §0): keep shared isomorphic.
  ...NODE_BUILTIN_MODULES,
  ...NODE_BUILTIN_MODULES.map((m) => `${m}/*`),
  'node:*',
  'node:*/*',
];

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.expo/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // TypeScript handles undefined-symbol detection; ESLint's no-undef
      // false-positives on types and globals in .ts/.tsx files.
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // CommonJS config files (e.g. metro.config.js) legitimately use require().
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // Architecture red line (PRD §3.4 / §13.1 + v0.2 §0): packages/shared must
    // stay UI-free (no React / react-native / UI libs / @xstate/react binding)
    // AND Node-free (no fs / path / process / ...), so it is isomorphic across
    // Vite / Metro / Node. The eslint-boundary.test.ts asserts this rule fires.
    files: ['packages/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: SHARED_RESTRICTED_IMPORT_PATTERNS }],
    },
  },
  {
    // apps/server is a NestJS app: empty @Module()/@Injectable() classes are
    // idiomatic, so no-extraneous-class would false-positive on them.
    files: ['apps/server/**/*.ts'],
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
);
