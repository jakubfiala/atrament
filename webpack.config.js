const path = require('path');

module.exports = {
    output: {
        path: path.resolve('./dist'),
        filename: 'atrament.min.js',
        library: 'Atrament',
        libraryTarget: 'var',
    },
    entry: [
        './index.js'
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
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    },
                    'eslint-loader?fix=true'
                ]
            }
        ]
    }
};
