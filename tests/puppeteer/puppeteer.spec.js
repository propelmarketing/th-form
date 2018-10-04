const utils = require('../../src/utils')
const { TESTING_PORT } = require('../../utils/env')
const { INPUT_RULES, VALIDATORS, MESSAGES } = require('../../src/constants')

const base_url = `http://localhost:${TESTING_PORT}`

// jest.setTimeout(40000)
// page.on('console', msg => console.log('PAGE LOG:', msg.text()))

describe('puppeteer tests', async () => {
  beforeAll(async () => {
    await page.goto(base_url)
  })

  describe('unnamed inputs', async () => {
    test('page rendered', async () => {
      await page.goto(`${base_url}/unnamed_inputs.html`)
      await expect(page).toMatch('unnamed inputs')
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
      // this can either be 4 or 2, if there are no TH cookies
      expect([hidden_inputs.length, 2]).toContain(inputs)
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
      await expect(page).toMatch('hooks')
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
      await expect(page).toMatch('async')
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

  describe('custom validation', () => {
    const msg_selector = '.th-form-validation:not(.hidden)'
    const user2 = Object.assign({}, user, {
      email: 'invalid'
    })
    test('page rendered', async () => {
      await page.goto(`${base_url}/custom_validation.html`)
      await expect(page).toMatch('custom validation')
    })
    test('missing required', async () => {
      await page.click('button')
      const message = await page.$eval(msg_selector, $el => {
        return $el.innerHTML.trim()
      })
      expect(message)
        .toBe(MESSAGES.requiredNamed('first name'))
    })
    test('invalid email', async () => {
      for (let key in user2) {
        await page.waitForSelector(`[name="${key}"]`)
        await page.focus(`[name="${key}"]`)
        await page.keyboard.type(`${user2[key]}`)
      }
      await page.click('button')
      const message = await page.$eval(msg_selector, $el => {
        return $el.innerHTML.trim()
      })
      expect(message)
        .toBe(INPUT_RULES.email.title)
    })
    test('exceed maxlength', async () => {
      const name = 'phone1'
      const selector = `[name="${name}"]`
      await page.focus(`[name="email"]`)
      await page.keyboard.type('@test.com')
      await page.evaluate((selector) => {
        document.querySelector(selector).value = 123456
      }, selector)
      await page.click('button')
      const maxlength = await page.$eval(selector, $el => {
        return $el.maxLength
      })
      const message = await page.$eval(msg_selector, $el => {
        return $el.innerHTML.trim()
      })
      expect(message)
        .toBe(VALIDATORS.maxlength.message(maxlength, name))
    })
    test('pattern mismatch', async () => {
      const name = 'phone1'
      const selector = `[name="${name}"]`
      await page.evaluate((selector) => {
        document.querySelector(selector).value = 'inv'
      }, selector)
      await page.click('button')
      const message = await page.$eval(msg_selector, $el => {
        return $el.innerHTML.trim()
      })
      expect(message)
        .toBe(INPUT_RULES.phone.title)
    })
  })
})
