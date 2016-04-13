var webpack = require('webpack');
module.exports = {
    output: {
        path: './demo/bundled/dist',
        filename: 'bundle.js'
    },
    entry: [
        './demo/bundled/src/handler.js'
    ],
    devtool: 'source-map',
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false,
            },
        }),
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                query: {
                    presets: ['es2015']
                }
            }
        ],
    }
};