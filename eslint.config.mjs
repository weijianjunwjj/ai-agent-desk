import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

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
    // Architecture red line (PRD §3.4 / §13.1): packages/shared must stay
    // UI-free — no React / react-native / UI libs, and no @xstate/react binding.
    files: ['packages/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'react',
            'react/*',
            'react-dom',
            'react-dom/*',
            'react-native',
            'react-native/*',
            '@xstate/react',
            '@xstate/react/*',
            'antd',
            'antd/*',
            '@ant-design/*',
          ],
        },
      ],
    },
  },
);
