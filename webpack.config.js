const webpack = require('webpack')
const path = require('path')
const env = require('./utils/env')
const postcssPresetEnv = require('postcss-preset-env')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

const ENTRY_FILENAME = 'index'
const ENTRY_PATH = path.join(__dirname, 'src', `${ENTRY_FILENAME}.js`)
const OUTPUT_FILENAME = 'THForm'
const BUNDLE_SUFFIX = '.bundle.js'

const ENV = env.NODE_ENV

const OUTPUT_PATH = ENV === 'development'
  ? 'build'
  : 'dist'

const DEVTOOL = ENV === 'development'
  ? 'cheap-module-eval-source-map'
  : false

const options = {
  mode: env.NODE_ENV,
  devtool: DEVTOOL,
  entry: {
    THForm: ENTRY_PATH
  },
  output: {
    path: path.join(__dirname, OUTPUT_PATH),
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
        test: /\.scss$/,
        use: [
          'css-loader',
          'sass-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                postcssPresetEnv({
                  stage: 3,
                  browsers: ['cover 99.5%', '> 5%']
                })
              ]
            }
          }
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
    new CleanWebpackPlugin([OUTPUT_PATH]),
    // expose and write the allowed env consts on the compiled bundle
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV)
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'examples', 'form.ejs'),
      filename: 'form.html',
      chunks: ['THForm'],
      inject: false,
      templateParameters(compilation, assets, _options) {
        return {
          scriptSrc: `./${OUTPUT_FILENAME}${BUNDLE_SUFFIX}`
        }
      }
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'examples', 'wix.ejs'),
      filename: 'wix.html',
      chunks: ['THForm'],
      inject: false,
      templateParameters(compilation, assets, _options) {
        return {
          scriptSrc: `./${OUTPUT_FILENAME}${BUNDLE_SUFFIX}`
        }
      }
    }),
    new WriteFilePlugin()
  ]
}

module.exports = options
