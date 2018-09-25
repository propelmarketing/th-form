/*
 * @jest-environment jsdom
 */

import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'
import * as utils from '../src/utils'
// import template from '../dist/async.html'

const template = fs.readFileSync(path.resolve(__dirname, `../dist/async.html`)).toString()

const dom = new JSDOM(template)
// console.log(dom.window.document)

const doc = dom.window.document

// console.log(doc.body.outerHTML)
describe('async form', () => {
  test('should poll for async form', async () => {
    await utils.sleep(2000)
    console.log(doc.body.outerHTML)
    expect(doc.querySelector('form')).not.toBe(null)
  })
})

console.log(window.THForm)
