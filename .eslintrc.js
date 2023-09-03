module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'deprecation'],
  extends: ['noftalint/typescript'],
  ignorePatterns: ['node_modules/', 'build/'],
  reportUnusedDisableDirectives: true,
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  rules: {
    'deprecation/deprecation': 'warn',

    // It cannot resolve TypeScript's path aliases. See https://github.com/mysticatea/eslint-plugin-node/issues/233
    'node/no-missing-import': 'off',

    // @typescript-eslint doesn't support mixins and cannot find the `.toString()` methods
    '@typescript-eslint/no-base-to-string': ['error', {
      ignoredTypeNames: ['TextChannel'],
    }],

    // TODO: When we have strictNullChecks enabled in tsconfig, enable this rule
    '@typescript-eslint/prefer-nullish-coalescing': 'off',

    // We cannot use ESM as typescript has very bad support (path aliases, source maps, adding .js to imports…)
    'unicorn/prefer-top-level-await': 'off',

    // Because discord.js is promised base, we use a lot of promises in loops/callbacks that needs
    // be resolved before continuing! (i.e to send reactions or messages in the right order).
    'no-await-in-loop': 'off',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
