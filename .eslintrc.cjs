module.exports = {
  ignorePatterns: ['dist'],
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/extensions': ['off'],
    'import/prefer-default-export': ['off'],
    'no-plusplus': ['off'],
  },
  overrides: [
    {
      files: ['src/*.js'],
      excludedFiles: 'demo/*.js',
    },
  ],
};
