module.exports = {
  parser: 'babel-eslint',
  extends: 'noftalint',
  ignorePatterns: ['.eslintrc.js', 'node_modules/', 'build/'],
  reportUnusedDisableDirectives: true,
  rules: {
    // String#replaceAll is neither in NodeJS nor in babel yet...
    'unicorn/prefer-replace-all': 'off',
  },
  env: {
    node: true,
  },
};
