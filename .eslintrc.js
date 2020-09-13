module.exports = {
  parser: 'babel-eslint',
  extends: 'noftalint',
  ignorePatterns: ['.eslintrc.js', 'node_modules/', 'build/'],
  reportUnusedDisableDirectives: true,
  env: {
    node: true,
  },
};
