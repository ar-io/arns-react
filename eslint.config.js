// eslint.config.js
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint-define-config';
import importPlugin from 'eslint-plugin-import';
import jestFormatting from 'eslint-plugin-jest-formatting';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tailwindcss from 'eslint-plugin-tailwindcss';

export default defineConfig([
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['node_modules', 'build', 'public', 'dist', 'docs'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021, // equivalent to ecmaVersion 12
        sourceType: 'module',
        jsx: true, // Enable JSX
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        require: 'readonly',
        define: 'readonly',
        process: 'readonly',
        module: 'readonly',
        global: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
    plugins: {
      'jest-formatting': jestFormatting,
      '@typescript-eslint': typescriptEslint,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      tailwindcss,
      prettier,
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
    },
    rules: {
      'prettier/prettier': ['error', {}, { usePrettierrc: true }], // Use .prettierrc file
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'off',
      // '@typescript-eslint/no-unused-vars': ["error", { vars: "all", args: "none", ignoreRestSiblings: false, argsIgnorePattern: "^_" }],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-useless-escape': 'off',
    },
  },
]);
