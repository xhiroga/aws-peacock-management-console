const js = require('@eslint/js')
const tseslint = require('typescript-eslint')
const eslintConfigPrettier = require('eslint-config-prettier')
const globals = require('globals')

const tsFilePatterns = ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts']
const tsConfigs = tseslint.configs.recommended.map((config) => ({
  ...config,
  files: tsFilePatterns,
}))

module.exports = [
  {
    ignores: ['dist/**', 'packages/**'],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
  },
  ...tsConfigs,
  {
    files: tsFilePatterns,
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    rules: {},
  },
  eslintConfigPrettier,
]
