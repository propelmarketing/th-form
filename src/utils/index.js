import {
  REQUEST_HEADERS
} from '../constants'

/**
 * get rules that match input name
 *
 * @param {*} name
 * @param {*} rules
 * @returns Object
 */

export function getInputRules(name, rules) {
  const key = Object.keys(rules)
    .find(rule => name.includes(rule))
  return rules[key] || {}
}

/**
 * transform a template string into a dom node
 *
 * @param {*} html
 * @export
 */
export function htmlToNode(html) {
  const $wrap = document.createElement('div')
  $wrap.innerHTML = html
  const $content = $wrap.childNodes
  return $content.length > 1
    ? $content
    : $content[0]
}

/**
 * bring xhr to es6
 *
 * @export
 * @param {*} url
 * @param {string} [method='GET']
 * @param {*} data
 * @returns Promise
 */
export function request(url, method = 'GET', data) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.addEventListener('load', resolve)
    request.addEventListener('error', (e) => {
      console.log('err!')
      reject(e)
    })
    request.open(method, url)
    request.setRequestHeader(...REQUEST_HEADERS)
    request.send(data)
    return request
  })
}

/**
 * async wait function
 *
 * @export
 * @param {*} duration
 * @returns Promise
 */
export function sleep(duration) {
  return new Promise(resolve => setTimeout(() => resolve(), duration))
}

/**
 * wait until dom is ready, with optional additional delay
 *
 * @export
 * @param {*} delay
 * @returns Promise
 */
export function ready(delay) {
  return new Promise(async resolve => {
    const complete = async () => {
      await sleep(delay)
      resolve()
    }
    if (/comp|inter|loaded/.test(document.readyState)) {
      complete()
    } else {
      window.addEventListener('load', complete, false)
    }
  })
}
