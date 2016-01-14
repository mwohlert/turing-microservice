const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');

const path = require('path');
const nodeModulesPath = path.resolve(__dirname, '../../node_modules');

module.exports = {
  target: 'web',
  cache: true,
  debug: true,
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'webpack-hot-middleware/client?reload=true',
    path.join(__dirname, '../../src/client/app.jsx')
  ],
  output: {
    path: path.join(__dirname, '../../src/server/public'),
    filename: 'js/app.js',
    publicPath: '/turing-microservice'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('css/main.css')
  ],
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loaders: ['babel?cacheDirectory&presets[]=es2015&presets[]=react&presets[]=react-hmre'],
        exclude: nodeModulesPath
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('css-loader!sass-loader')
      }
    ]
  },
  sassLoader: {
    outputStyle: 'compressed'
  },
  resolve: {
    extensions: [
      '',
      '.js',
      '.jsx',
      '.scss'
    ]
  }
};
