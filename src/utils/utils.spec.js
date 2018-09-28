/**
 * @jest-environment jsdom
 */

import { html } from 'common-tags'
import * as utils from '@/utils'

// utils.setScope(window)

function createXHRmock(status) {
  const setRequestHeader = jest.fn()
  const open = jest.fn()
  const send = jest.fn().mockImplementation(function() {
    this.status = status
    this.onreadystatechange && this.onreadystatechange()
  })
  const xhrMock = () => {
    return {
      open,
      send,
      setRequestHeader
    }
  }
  window.XMLHttpRequest = jest.fn().mockImplementation(xhrMock)
}

describe('getInputRules', () => {
  test('exact match', () => {
    const rules = utils.getInputRules('email')
    expect(rules.type).toBe('email')
    expect(rules.test).toBeInstanceOf(Function)
  })
  test('close match', () => {
    const rules = utils.getInputRules('email_address')
    expect(rules.type).toBe('email')
    expect(rules.test).toBeInstanceOf(Function)
  })
  test('no match', () => {
    const rules = utils.getInputRules('supercool')
    expect(rules).toBe(false)
  })
})

describe('htmlToNode', () => {
  test('single node', () => {
    const template = html`
    <div class="test">
      Hello World
    </div>
    `
    const $div = utils.htmlToNode(template)
    expect($div).toBeInstanceOf(HTMLDivElement)
    expect($div.className).toBe('test')
    expect($div.innerHTML.trim()).toBe('Hello World')
  })
  test('multiple nodes', () => {
    const template = html`
    <div class="test1">
      Hello World
    </div>
    <div class="test2">
      Hello World
    </div>
    `
    const $divs = utils.htmlToNode(template)
    const arr = Array.from($divs)
    expect(arr.length).toBe(3)
    expect(arr[0]).toBeInstanceOf(HTMLDivElement)
    expect(arr[1]).toBeInstanceOf(Text)
    expect(arr[2]).toBeInstanceOf(HTMLDivElement)
  })
})

describe('replaceNode', () => {
  test('basic', () => {
    const $parent = document.createElement('div')
    const template1 = html`
    <div class="test1">
      Hello World
    </div>
    `
    const template2 = html`
    <div class="test2">
      Hello World2
    </div>
    `
    const $div = utils.htmlToNode(template1)
    $parent.appendChild($div)
    utils.replaceNode($div, template2)
    expect($parent.querySelector('.test1')).toBe(null)
    expect($parent.querySelectorAll('.test2').length).toBe(1)
  })
})

describe('appendChild', () => {
  test('single child', () => {
    const $parent = document.createElement('div')
    const template = html`
    <div class="child"></div>
    `
    const $child = utils.htmlToNode(template)
    utils.appendChild($parent, $child)
    expect($parent.querySelectorAll('.child').length).toBe(1)
  })
  test('multiple children', () => {
    const $parent = document.createElement('div')
    const template1 = html`
    <div class="child1"></div>
    `
    const template2 = html`
    <div class="child2"></div>
    `
    const $child1 = utils.htmlToNode(template1)
    const $child2 = utils.htmlToNode(template2)
    utils.appendChild($parent, $child1, $child2)
    expect($parent.querySelectorAll('.child1').length).toBe(1)
    expect($parent.querySelectorAll('.child2').length).toBe(1)
  })
})

describe('showElement/hideElement', () => {
  const $one = document.createElement('div')
  const $two = document.createElement('div')
  const $three = document.createElement('div')
  test('hideElement - single element', () => {
    expect(utils.hideElement($one)[0].className).toBe('hidden')
  })
  test('hideElement - multiple elements', () => {
    const arr = utils.hideElement($two, $three)
    expect(arr[0].className).toBe('hidden')
    expect(arr[1].className).toBe('hidden')
  })
  test('showElement - single element', () => {
    expect(utils.showElement($one)[0].className).toBe('')
  })
  test('showElement - multiple elements', () => {
    const arr = utils.showElement($two, $three)
    expect(arr[0].className).toBe('')
    expect(arr[1].className).toBe('')
  })
})

describe('getFormData', () => {
  test('serialize', () => {
    const $form = utils.htmlToNode(
      html`
      <form>
        <input type="text" name="first_name" value="Pizza" />
        <input type="text" name="last_name" value="The Hut" />
      </form>
      `
    )
    expect(utils.getFormData($form)).toBe('first_name=Pizza&last_name=The+Hut')
  })
})

describe('testValidationSupport', () => {
  test('basic', () => {
    expect(utils.testValidationSupport()).toBe(true)
  })
})

describe('ready', () => {
  test('basic', () => {
    expect(utils.ready()).toBeInstanceOf(Promise)
  })
  test('delay', () => {
    expect.assertions(1)
    const t1 = performance.now()
    return utils.ready(120)
      .then(() => {
        const t2 = performance.now()
        const diff = (t2 - t1)
        expect(diff).toBeGreaterThan(100)
      })
  })
})

describe('request', async () => {
  test('success', async () => {
    createXHRmock(200)
    const response = await utils.request('/', 'POST', { test: true })
    expect(response.status).toBe(200)
  })
})
