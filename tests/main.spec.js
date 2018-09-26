/*
 * @jest-environment jsdom
 */

import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'
import * as utils from '../src/utils'
const template_path = path.resolve(__dirname, `../dist/async.html`)
const template = fs.readFileSync(template_path).toString()
const jsdom_options = {
  resources: 'usable',
  runScripts: 'dangerously'
}
const dom = new JSDOM(template, jsdom_options)

const doc = dom.window.document

console.log(doc.head.outerHTML)
describe('async form', () => {
  test('should poll for async form', async () => {
    await utils.sleep(2000)
    console.log(doc.body.outerHTML)
    expect(doc.querySelector('form')).not.toBe(null)
  })
})

console.log(window.THForm)
