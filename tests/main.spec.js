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
  let $form
  test('set form action', async () => {
    await utils.sleep(1600)
    $form = document.querySelector('form')
    expect($form.action)
      .toBe('https://my.thrivehive.com/webform/directFormHandler')
  })
  test('THForm should have added hidden inputs', () => {
    $form = document.querySelector('form')
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
    // this can either be 4 or 2, if there are no TH cookies
    expect([hidden_inputs.length, 2])
      .toContain($hidden.length)
  })
})

describe('async form', () => {
  const dom = new JSDOM(template, jsdom_options)
  const { window } = dom
  const { document } = window
  THForm._setScope(window)
  let onErrorCalled = false
  const form = new THForm('#new-form', 'test', {
    poll: true,
    onError() {
      onErrorCalled = true
    },
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
  let $form
  test('should poll for a form that will be added asynchronously', async () => {
    await utils.sleep(1500)
    document.body.innerHTML = `
    <form id="new-form" autocomplete="on" action="/" method="POST">
      <label class="caption">
        <input name="fname" type="text" maxlength="30">
        First Name
      </label>
      <label class="caption">
        <input name="lname" type="text" maxlength="30">
        Last Name
      </label>
      <label for="email">Email Address <span class="required">*</span></label>
      <input name="email" type="text" id="email">
      <button>Submit</button>
      <input type="hidden" name="meta.form-id" value="test">
    </form>
    `
    await utils.sleep(300)
    $form = document.querySelector('#new-form')
    expect($form.parentNode.className).toBe('th-form-wrapper')
  })

  test('submiting form should fire onError hook', async () => {
    $form.querySelector('[name="first_name"]').value = 'a'
    $form.querySelector('[name="last_name"]').value = 'b'
    $form.querySelector('[name="email"]').value = 'b@a.com'
    await form.onSubmit({ preventDefault() {} })
    expect(onErrorCalled).toBe(true)
  })

  test('validation failure', async () => {
    form.options.customValidation = true
    $form.querySelector('[name="email"]').value = 'invalidemail'
    await form.onSubmit({ preventDefault() {} })
    const $msg = $form.querySelector('.message.error:not(.hidden)')
    expect($msg).not.toBe(null)
  })
})
