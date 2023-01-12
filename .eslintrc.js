module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['noftalint/typescript'],
  ignorePatterns: ['node_modules/', 'build/'],
  reportUnusedDisableDirectives: true,
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  rules: {
    // It cannot resolve TypeScript's path aliases. See https://github.com/mysticatea/eslint-plugin-node/issues/233
    'node/no-missing-import': 'off',
    // It doesn't work with TypeScript
    'import/no-import-module-exports': 'off',

    // @typescript-eslint can't find the `.toString()` method for these types, but it
    // does exists as it is inherited from the `Channel` class.
    '@typescript-eslint/no-base-to-string': ['error', {
      ignoredTypeNames: ['TextChannel', 'NewsChannel'],
    }],

    // TODO: When we have strictNullChecks enabled in tsconfig, enable this rule
    '@typescript-eslint/prefer-nullish-coalescing': 'off',

    // We don't necessarily want to use `this` in our class methods (such as `Command#exec`),
    // but neither do we want them to be static.
    'class-methods-use-this': 'off',

    // Even though `Array#forEach()` should be avoided, let's  wait until we have an answer on this one
    // https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1093
    'unicorn/no-array-for-each': 'off',

    // Because discord.js is promised base, we use a lot of promises in loops/callbacks that needs
    // be resolved before continuing! (i.e to send reactions or messages in the right order).
    'no-await-in-loop': 'off',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  globals: {
    Generator: true,
    AsyncGenerator: true,
  },
};
