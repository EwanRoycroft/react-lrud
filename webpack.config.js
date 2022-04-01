const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: ['./demo/index'],
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'build'),
        libraryTarget: 'umd',
        filename: 'main.bundle.js',
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './demo/index.html',
        }),
    ],

    devServer: {
        host: '0.0.0.0',
        port: 8080,

        hot: false, // Disable hot-reloading of JS modules while the web app is running
        inline: false,
    },

    module: {
        rules: [
            {
                // Compile React/JSX
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
        ],
    },
};
