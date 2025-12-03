const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const checkFile = require('eslint-plugin-check-file');

module.exports = [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        node: true,
        es2020: true,
        I: 'readonly',
        Given: 'readonly',
        When: 'readonly',
        Then: 'readonly',
        inject: 'readonly',
        locate: 'readonly',
        tryTo: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'check-file': checkFile
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-console': 'off',
      'check-file/filename-naming-convention': [
        'error',
        {
          'pages/**/*.ts': 'PASCAL_CASE',
          'locators/**/*.ts': 'PASCAL_CASE',
          'tests/helpers/**/*.ts': 'PASCAL_CASE',
          'step_definitions/**/*.ts': 'KEBAB_CASE',
          'features/**/*.feature': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true
        }
      ]
    }
  },
  {
    ignores: [
      'node_modules/',
      'output/',
      'downloads/',
      'test-results/',
      'playwright-report/',
      'example_frameworks/',
      '**/*.js',
      '!eslint.config.js'
    ]
  }
];
