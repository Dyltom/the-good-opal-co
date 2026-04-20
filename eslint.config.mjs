import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import nextPlugin from '@next/eslint-plugin-next'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

const tsRecommended = tsPlugin.configs['flat/recommended']
const reactFlatConfigs = reactPlugin.configs.flat

const config = [
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/.payload/**',
      'next-env.d.ts',
      'scripts/**',
      'src/scripts/**',
    ],
  },

  // TypeScript base config (language options + plugins)
  ...tsRecommended,

  // Main rules for TypeScript/TSX files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
      next: { rootDir: '.' },
    },
    rules: {
      // Next.js recommended + Core Web Vitals rules
      ...nextPlugin.flatConfig.recommended.rules,
      ...nextPlugin.flatConfig.coreWebVitals.rules,

      // React rules
      ...reactFlatConfigs.recommended.rules,
      ...reactFlatConfigs['jsx-runtime'].rules,

      // React hooks rules
      ...reactHooksPlugin.configs.recommended.rules,

      // TypeScript overrides
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // JavaScript files (no TypeScript parsing needed)
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
]

export default config
