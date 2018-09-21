const { TESTING_PORT } = require('../utils/env')
// const utils = require('../src/utils')

const base_url = `http://localhost:${TESTING_PORT}`

jest.setTimeout(40000)

describe('e2e tests', async () => {

  beforeAll(async () => {
    await page.goto(base_url)
  })

  describe('unnamed inputs', async () => {

    test('form rendered', async () => {
      await page.goto(`${base_url}/unnamed_inputs.html`)
      await expect(page).toMatch('Last Name')
    })

    test('unnamed inputs have a name', async () => {
      const renamed_inputs = [
        'phone1',
        'phone2',
        'phone3'
      ]
      const selector = renamed_inputs.map(name => {
        return `input[name="${name}"]`
      }).join(',')
      const inputs = await page.$$eval(selector, divs => {
        return divs.length
      })
      expect(inputs).toBe(renamed_inputs.length)
    })

    test('hidden inputs were added', async () => {
      const hidden_inputs = [
        'meta.form-id',
        'meta.trackerid',
        'CA-uid',
        'CA-sess'
      ]
      const selector = hidden_inputs.map(name => {
        return `input[name="${name}"]`
      }).join(',')
      const inputs = await page.$$eval(selector, divs => {
        return divs.length
      })
      expect(inputs).toBe(hidden_inputs.length)
    })
  })
})
