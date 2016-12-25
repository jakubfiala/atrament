var webpack = require('webpack');
module.exports = {
    output: {
        path: './dist',
        filename: 'atrament.min.js',
        libraryTarget: 'umd',
        library: 'atrament'
    },
    entry: [
        './index.js'
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
                loaders: ['babel?presets[]=es2015', 'eslint?fix=true'],
            }
        ],
    }
};