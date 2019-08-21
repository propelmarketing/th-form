const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const sass = require('sass')
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

const PUBLIC_PATH = 'examples'
const OUTPUT_PATH = ENV === 'production'
  ? 'dist'
  : 'build'

const DEVTOOL = ENV === 'production'
  ? false
  : 'cheap-module-eval-source-map'

const mode = ENV === 'test'
  ? 'development'
  : ENV

const templates = fs.readdirSync('./examples')
  .filter(filename => /\.ejs$/gi.test(filename))

const options = {
  mode,
  devtool: DEVTOOL,
  entry: {
    THForm: ENTRY_PATH
  },
  output: {
    path: path.join(__dirname, OUTPUT_PATH),
    publicPath: path.join(__dirname, PUBLIC_PATH),
    filename: `[name]${BUNDLE_SUFFIX}`
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                postcssPresetEnv({
                  stage: 3,
                  browsers: [
                    'cover 99.5%',
                    '> 5%'
                  ]
                })
              ]
            }
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: sass
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
      'process.env.NODE_ENV': JSON.stringify(ENV)
    }),
    ...templates.map(template => {
      const name = template.split('.ejs')[0]
      return new HtmlWebpackPlugin({
        template: path.join(__dirname, 'examples', template),
        filename: `${name}.html`,
        chunks: ['THForm'],
        inject: false,
        templateParameters(compilation, assets, _options) {
          return {
            scriptSrc: `./${OUTPUT_FILENAME}${BUNDLE_SUFFIX}`
          }
        }
      })
    }),
    new WriteFilePlugin()
  ]
}

module.exports = options
