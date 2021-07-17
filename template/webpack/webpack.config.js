const template = `
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: {
        index: path.resolve(__dirname, './src/index.jsx'),
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/[name].js'
    },
    module: {
        rules: [
            {
                test: /.(js|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /.(scss|css)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            modules: false
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test:/\\.(png|jpg|gif|jpeg)/,
                exclude: /node_modules/,
                use:[{
                    loader:'url-loader',
                    options: {
                        limit: 1024
                    }
                }]
            },
            {
                test: /\\.(woff|woff2|ttf|eot|svg)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'file-loader?name=fonts/[name].[hash:8].[ext]',
                    },
                ],
            },
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin({
            // Options...
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: '[id].css',
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, './public/index.html'),
        }),
    ],
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx']
    },
    devServer: {
        host: '127.0.0.1',
        historyApiFallback: true,
        hot: true,
        inline: true,
        port: 9000
    }
};`;

module.exports = {
    template
}
