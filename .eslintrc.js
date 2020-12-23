module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['noftalint', 'noftalint/typescript'],
  ignorePatterns: ['.eslintrc.js', 'gulpfile.js', 'node_modules/', 'build/'],
  reportUnusedDisableDirectives: true,
  rules: {
    'node/file-extension-in-import': 'off',
    'import/extensions': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-base-to-string': 'off',

    // String#replaceAll is neither in NodeJS nor in babel yet...
    'unicorn/prefer-replace-all': 'off',
  },
  globals: {
    NodeJS: true,
  },
  env: {
    node: true,
  },
};
