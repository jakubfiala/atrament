const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  output: {
    path: path.resolve('./dist'),
    filename: 'atrament.min.js',
    library: {
      name: 'Atrament',
      type: 'umd',
    },
  },
  entry: [
    './index.js',
  ],
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
    ],
  },
  plugins: [new ESLintPlugin()],
};
