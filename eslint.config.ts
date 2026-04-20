import type { Linter } from 'eslint'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
// @ts-expect-error – @next/eslint-plugin-next types don't yet expose flatConfig
import nextPlugin from '@next/eslint-plugin-next'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

// typescript-eslint flat/recommended is an array of 3 config objects
// (languageOptions + plugins, ts-file overrides, recommended rules)
const tsRecommended = tsPlugin.configs['flat/recommended'] as Linter.Config[]

// eslint-plugin-react exports a `flat` sub-namespace for flat-config consumers
const reactFlatConfigs = reactPlugin.configs.flat as Record<
  string,
  { rules?: Linter.RulesRecord }
>

const config: Linter.Config[] = [
  // ------------------------------------------------------------------
  // Global ignores
  // ------------------------------------------------------------------
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
    ],
  },

  // ------------------------------------------------------------------
  // TypeScript: base language options + TS recommended rules
  // ------------------------------------------------------------------
  ...tsRecommended,

  // ------------------------------------------------------------------
  // Next.js, React & React-Hooks rules for TS/TSX files
  // ------------------------------------------------------------------
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser as Linter.Parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      '@next/next': nextPlugin,
      react: reactPlugin as unknown as Linter.Plugin,
      'react-hooks': reactHooksPlugin as unknown as Linter.Plugin,
    },
    settings: {
      react: { version: 'detect' },
      next: { rootDir: '.' },
    },
    rules: {
      // Next.js core-web-vitals rules (runtime export exists, types lag behind)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...(nextPlugin.flatConfig?.recommended?.rules as Linter.RulesRecord | undefined),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...(nextPlugin.flatConfig?.coreWebVitals?.rules as Linter.RulesRecord | undefined),

      // React recommended + JSX runtime (no need to import React in scope)
      ...reactFlatConfigs['recommended']?.rules,
      ...reactFlatConfigs['jsx-runtime']?.rules,

      // React Hooks
      ...reactHooksPlugin.configs.recommended.rules,

      // Project-specific TypeScript overrides
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // ------------------------------------------------------------------
  // Plain JS config files at the root
  // ------------------------------------------------------------------
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
]

export default config
