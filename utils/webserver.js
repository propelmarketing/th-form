const WebpackDevServer = require('webpack-dev-server')
const webpack = require('webpack')
const config = require('../webpack.config')
const env = require('./env')
const path = require('path')
const chalk = require('chalk')

function server(port) {
  const excludeEntriesToHotReload = config.notHotReload || []

  for (let entryName in config.entry) {
    if (!excludeEntriesToHotReload.includes(entryName)) {
      config.entry[entryName] = [
        `webpack-dev-server/client?http://localhost:${env.PORT}`,
        `webpack/hot/dev-server`
      ].concat(config.entry[entryName])
    }
  }

  delete config.notHotReload

  config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(config.plugins || [])

  const compiler = webpack(config)

  compiler.hooks.done.tap('done_message', () => {
    console.log(chalk.blueBright(`Webpack dev server listening on port ${env.PORT}`))
  })

  return new Promise((resolve, reject) => {
    const server = new WebpackDevServer(compiler, {
      hot: true,
      quiet: true,
      contentBase: path.join(__dirname, '../build'),
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }, () => resolve()).listen(port || env.PORT, '0.0.0.0', () => {
      resolve(server)
    }).on('error', (err) => {
      reject(err)
    })
  })
}

module.exports = server
