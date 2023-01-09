module.exports = {
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
    'no-plusplus': ['off'],
  },
  overrides: [
    {
      files: ['src/*.js'],
      excludedFiles: 'demo/*.js',
    },
  ],
};
