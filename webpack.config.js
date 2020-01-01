const webpack = require('webpack');

module.exports = {
    output: {
        path: './dist',
        filename: 'atrament.min.js',
        library: 'Atrament',
        libraryTarget: 'var',
    },
    entry: [
        './index.js'
    ],
    devtool: 'source-map',
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        })
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loaders: ['babel?presets[]=env', 'eslint?fix=true']
            }
        ]
    }
};
