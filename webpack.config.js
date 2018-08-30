const webpack = require('webpack')
const path = require('path')
const env = require('./utils/env')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

const THFORM_FILENAME = 'THForm'
const THFORM_PATH = path.join(__dirname, 'src', `${THFORM_FILENAME}.js`)
const BUNDLE_SUFFIX = '.bundle.js'

const options = {
  mode: env.NODE_ENV,
  entry: {
    THForm: THFORM_PATH
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: `[name]${BUNDLE_SUFFIX}`
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'css-loader'
        ]
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    // clean the build folder
    new CleanWebpackPlugin(['build']),
    // expose and write the allowed env consts on the compiled bundle
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV)
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'tests', 'form.ejs'),
      filename: 'form.html',
      chunks: ['THForm'],
      inject: false,
      templateParameters(compilation, assets, _options) {
        return {
          scriptSrc: `./${THFORM_FILENAME}${BUNDLE_SUFFIX}`
        }
      }
    }),
    new WriteFilePlugin()
  ]
}

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-eval-source-map'
}

module.exports = options
