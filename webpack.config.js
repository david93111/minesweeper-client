const path = require('path');
const config = require('./package.json');

const webpack = require('webpack');
require('dotenv').config();

const PROD = process.env.NODE_ENV === 'production';

let plugins = [];

module.exports = {
  mode: process.env.NODE_ENV,
  entry: path.resolve(__dirname, config.main),
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (PROD) ? 'msweeperclient.min.js' : 'msweeperclient.js',
    library: process.env.NAME,
    libraryTarget: process.env.TARGET,
  },
  module: {
    rules: [
      { 
        test:  /\.es6?$/, 
        exclude: /node_modules/, 
        loader: 'babel-loader' 
      }
    ]
  },
  optimization: {
    minimize: PROD ? true: false
  },
  plugins: plugins
};