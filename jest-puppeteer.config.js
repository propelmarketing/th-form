const { TESTING_PORT } = require('./utils/env')

module.exports = {
  server: {
    command: `PORT=${TESTING_PORT} node utils/dev.js`,
    port: TESTING_PORT,
    launchTimeout: 35000
  },
  launch: {
    headless: false,
    devtools: true,
    // slowMo: 10,
    args: [ '--disable-web-security' ]
  }
}
