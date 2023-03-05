const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
    mode: "development",
    entry: './src/ts/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        static: {
            directory: __dirname,
        },
        client: {
            overlay: true,
        },
        port: 8000,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: './index.html'
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: "./assets/",
                    to: "./assets/",
                },
                {
                    from: "./src/css/",
                    to: "./css/",
                }
            ],
        }),
    ],
};
