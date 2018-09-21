const { TESTING_PORT } = require('../utils/env')

describe('e2e tests', async () => {
  beforeAll(async () => {
    // jest.setTimeout(35000)
    await page.goto(`http://localhost:${TESTING_PORT}`)
  })

  it('should display "google" text on page', async () => {
    await expect(page).toMatch('google')
  })
})
