/*
 * These unit tests use jsdom to simulate the DOM
 * Because we are creating a window instace from scratch,
 * we must use the THForm._setScope static method to bind
 * the new window instance
 */

import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

import THForm from '../src/THForm'
import * as utils from '../src/utils'
const { INPUT_RULES, VALIDATORS, MESSAGES } = require('../src/constants')

const template_path = path.resolve(__dirname, `../dist/unit.html`)
const template = fs.readFileSync(template_path).toString()
const jsdom_options = {
  url: 'file://' + path.resolve(__dirname, '../dist/*'),
  resources: 'usable',
  runScripts: 'dangerously'
}

describe('regular form', () => {
  const dom = new JSDOM(template, jsdom_options)
  const { window } = dom
  const { document } = window
  THForm._setScope(window)

  new THForm('form', 'test', { // eslint-disable-line
    mappedInputs: [
      {
        name: 'fname',
        newName: 'first_name',
        required: true
      },
      {
        name: 'lname',
        newName: 'last_name',
        required: true
      },
      {
        name: 'email',
        required: true
      }
    ]
  })

  test('set form action', async () => {
    await utils.sleep(1000)
    const $form = document.querySelector('form')
    expect($form.action)
      .toBe('https://my.thrivehive.com/webform/directFormHandler')
  })

  test('set form id', () => {
    const $form = document.querySelector('form')
    expect($form.id).not.toBe(undefined)
  })

  test('THForm should have added hidden inputs', async () => {
    // await utils.sleep(1000)
    const $form = document.querySelector('form')
    const hidden_inputs = [
      'meta.form-id',
      'meta.trackerid',
      'CA-uid',
      'CA-sess'
    ]
    const selector = hidden_inputs.map(name => {
      return `input[name="${name}"]`
    }).join(',')
    const $hidden = $form.querySelectorAll(selector)
    // this can either be 4 or 2, 2 if there are no TH cookies
    expect([hidden_inputs.length, 2])
      .toContain($hidden.length)
  })

  test('remove inline event listeners', () => {
    const $form = document.querySelector('form')
    const $button = document.querySelector('button')
    expect($form.getAttribute('onSubmit')).toBe(null)
    expect($button.getAttribute('onClick')).toBe(null)
  })
})

describe('async form', () => {
  const dom = new JSDOM(template, jsdom_options)
  const { window } = dom
  const { document } = window
  THForm._setScope(window)

  const selector = '#new-form'
  const delay = 700

  new THForm(selector, 'test', {  // eslint-disable-line
    poll: true,
    mappedInputs: [
      {
        name: 'email',
        required: true
      }
    ]
  })

  test('form should not be on the page', () => {
    setTimeout(() => {
      document.body.innerHTML = `
        <form id="new-form" action="/">
          <input name="email" type="text" id="email">
          <button>Submit</button>
        </form>
        `
    }, delay)
    const $form = document.querySelector(selector)
    expect($form).toBe(null)
  })

  test('should poll for selector and bind it after it is added to the DOM', async () => {
    await utils.sleep(delay + 600)
    const $form = document.querySelector(selector)
    expect($form.parentNode.className).toBe('th-form-wrapper')
  })
})

describe('validation & hooks', () => {
  const dom = new JSDOM(template, jsdom_options)
  const { window } = dom
  const { document } = window

  THForm._setScope(window)
  const delay = 500
  let onSubmitCalled = false
  let onErrorCalled = false
  let $form

  const form = new THForm('#new-form2', 'test', {
    poll: true,
    onSubmit() {
      onSubmitCalled = true
    },
    onError() {
      onErrorCalled = true
    },
    mappedInputs: [
      {
        name: 'fname',
        newName: 'first_name'
      },
      {
        name: 'email'
      }
    ]
  })

  test('set up form', async () => {
    setTimeout(() => {
      document.body.innerHTML = `
        <form id="new-form2">
          <input name="fname" type="text" maxlength="4" minlength="2">
          <input name="count" type="number" min="2" max="4">
          <input name="phone" type="text">
          <input name="email" type="text">
          <button>Submit</button>
        </form>
        `
    }, delay)
    await utils.sleep(delay + 600)
    $form = document.querySelector('#new-form2')
    expect($form.parentNode.className).toBe('th-form-wrapper')
  })

  test('submiting form should fire onSubmit hook', async () => {
    await form.submit()
    expect(onSubmitCalled).toBe(true)
  })

  test('submiting form should fire onError hook', async () => {
    $form.querySelector('[name="email"]').value = 'b@a.com'
    await form.submit()
    expect(onErrorCalled).toBe(true)
  })

  describe('validation', () => {
    beforeEach(() => {
      form.options.customValidation = true
      $form.reset()
    })

    test('email', async () => {
      $form.querySelector('[name="email"]').value = 'invalid'
      await form.submit()
      const $msg = $form.querySelector('.message.error:not(.hidden)')
      const message = $msg.innerHTML.trim()
      expect(message).toBe(INPUT_RULES.email.title)
    })

    test('phone', async () => {
      $form.querySelector('[name="phone"]').value = 'invalid'
      await form.submit()
      const $msg = $form.querySelector('.message.error:not(.hidden)')
      const message = $msg.innerHTML.trim()
      expect(message).toBe(INPUT_RULES.phone.title)
    })

    test('minlength', async () => {
      const $input = $form.querySelector('[name="first_name"]')
      $input.value = 'a'
      const { name, minLength } = $input

      await form.submit()
      const $msg = $form.querySelector('.message.error:not(.hidden)')
      const message = $msg.innerHTML.trim()
      expect(message)
        .toBe(VALIDATORS.minlength.message(minLength, name))
    })

    test('maxlength', async () => {
      const $input = $form.querySelector('[name="first_name"]')
      $input.value = 'invalid'
      const { name, maxLength } = $input

      await form.submit()
      const $msg = $form.querySelector('.message.error:not(.hidden)')
      const message = $msg.innerHTML.trim()
      expect(message)
        .toBe(VALIDATORS.maxlength.message(maxLength, name))
    })

    test('min', async () => {
      const $input = $form.querySelector('[name="count"]')
      $input.value = 1
      const { name, min } = $input

      await form.submit()
      const $msg = $form.querySelector('.message.error:not(.hidden)')
      const message = $msg.innerHTML.trim()
      expect(message)
        .toBe(VALIDATORS.min.message(min, name))
    })

    test('required', async () => {
      const $input = $form.querySelector('[name="count"]')
      $input.required = true
      const { name } = $input

      await form.submit()
      const $msg = $form.querySelector('.message.error:not(.hidden)')
      const message = $msg.innerHTML.trim()
      expect(message)
        .toBe(MESSAGES.requiredNamed(name))
    })
  })
})
