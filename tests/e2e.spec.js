// const puppeteer = require('puppeteer')
const server = require('../utils/webserver')

console.log('e2d')
jest.setTimeout(35000)

describe('e2e tests', async () => {
  beforeAll(async () => {
    console.log('beforeAll')
    jest.setTimeout(35000)
    await server(4321)
    await page.goto('https://localhost:4321')
  })

  it('should display "google" text on page', async () => {
    await expect(page).toMatch('google')
  })
  // console.log('server is running nau')
  // let browser = await puppeteer.launch({
  //   headless: false
  // })
  // let page = await browser.newPage()

  // page.emulate({
  //   viewport: {
  //     width: 500,
  //     height: 2400
  //   },
  //   userAgent: ''
  // })

  // await page.goto('http://localhost:4321/')
  // await page.waitForSelector('.App-title')

  // test('wear', () => {
  //   expect(1).toBe(1)
  // })
})
