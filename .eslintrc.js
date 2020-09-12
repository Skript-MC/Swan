module.exports = {
  parser: 'babel-eslint',
  extends: 'noftalint',
  ignorePatterns: ['.eslintrc.js', 'node_modules/'],
  reportUnusedDisableDirectives: true,
  env: {
    node: true,
  },
};
