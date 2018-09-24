const { TESTING_PORT } = require('../utils/env')
const utils = require('../src/utils')

const base_url = `http://localhost:${TESTING_PORT}`

// jest.setTimeout(40000)
// page.on('console', msg => console.log('PAGE LOG:', msg.text()))

describe('e2e tests', async () => {
  beforeAll(async () => {
    await page.goto(base_url)
  })

  describe('unnamed inputs', async () => {
    test('page rendered', async () => {
      await page.goto(`${base_url}/unnamed_inputs.html`)
      await expect(page).toMatch('Test unnamed inputs')
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

  const user = {
    first_name: 'Abe',
    last_name: 'Lincoln',
    phone1: 617,
    phone2: 999,
    phone3: 9999
  }

  describe('hooks', () => {
    test('page rendered', async () => {
      await page.goto(`${base_url}/hooks.html`)
      await expect(page).toMatch('Test hooks')
    })
    test('onError hook', async () => {
      for (let key in user) {
        await page.focus(`[name="${key}"]`)
        await page.keyboard.type(`${user[key]}`)
      }
      await expect(page).toDisplayDialog(async () => {
        await expect(page).toClick('input[type="submit"]')
      })
    })
  })

  describe('async form', async () => {
    const selector = 'form'
    test('page rendered', async () => {
      await page.goto(`${base_url}/async.html`)
      await expect(page).toMatch('Test async')
    })
    test('no form on page', async () => {
      const form_count = await page.$$eval(selector, result => {
        return result.length
      })
      expect(form_count).toBe(0)
    })
    test('form should be added', async () => {
      await page.waitForSelector(selector)
      const form_count = await page.$$eval(selector, result => {
        return result.length
      })
      expect(form_count).toBe(1)
    })
    test('form should have been given an ID', async () => {
      await utils.sleep(10)
      const form_id = await page.$eval(selector, el => el.id)
      expect(form_id).not.toBe(undefined)
    })
  })
})
