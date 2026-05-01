module.exports = {
  extends: ['expo', 'prettier'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: ['node_modules/', 'dist/', '.expo/', 'docker/', 'scripts/'],
};
