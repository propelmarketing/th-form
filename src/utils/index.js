import serialize from 'form-serialize'
import {
  REQUEST_HEADERS,
  INPUT_RULES
} from '../constants'

/**
 * get urlencoded form data from DOM node
 *
 * @export
 * @param {*} $form
 * @returns String
 */
export function getFormData($form) {
  return serialize($form)
}

/**
 * get rules that match input name
 *
 * @param {*} name
 * @param {*} rules
 * @returns Object
 */

export function getInputRules(name, returnEmpty = false) {
  const key = Object.keys(INPUT_RULES)
    .find(rule => name.toLowerCase().includes(rule))
  return INPUT_RULES[key] || (returnEmpty && {})
}

/**
 * transform html into a dom node(s)
 *
 * @param {*} html
 * @export
 * @returns HTMLElement | NodeList
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
 * replace dom node with new html
 *
 * @export
 * @param {*} $el
 * @param {*} html
 * @returns HTMLElement
 */
export function replaceNode($el, html) {
  const $new_node = htmlToNode(html)
  $el.parentNode.replaceChild($new_node, $el)
  return $new_node
}

/**
 * append any number of child DOM nodes
 *
 * @export
 * @param {*} $el
 * @param {*} $children
 * @returns Array
 */
export function appendChild($el, ...$children) {
  return $children.map($child => $el.appendChild($child))
}

/**
 * show DOM node
 *
 * @export
 * @param {*} $els
 * @returns Array
 */
export function showElement(...$els) {
  return $els.map($el => {
    $el.classList.remove('hidden')
    return $el
  })
}

/**
 * hide DOM node
 *
 * @export
 * @param {*} $els
 * @returns Array
 */
export function hideElement(...$els) {
  return $els.map($el => {
    $el.classList.add('hidden')
    return $el
  })
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
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      const status = xhr.status
      if (status) {
        return /^2/.test(status)
          ? resolve(xhr)
          : reject(xhr)
      }
    }
    xhr.open(method, url)
    REQUEST_HEADERS.map(obj => {
      for (let key in obj) {
        xhr.setRequestHeader(key, obj[key])
      }
    })
    xhr.send(data)
    return xhr
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
      document.addEventListener('DOMContentLoaded', complete, false)
    }
  })
}

/**
 * test for html form validation support
 *
 * @export
 * @returns Boolean
 */
export function testValidationSupport() {
  const input = document.createElement('input')
  return (
    'validity' in input &&
    'badInput' in input.validity &&
    'patternMismatch' in input.validity &&
    'rangeOverflow' in input.validity &&
    'rangeUnderflow' in input.validity &&
    'stepMismatch' in input.validity &&
    'tooLong' in input.validity &&
    'tooShort' in input.validity &&
    'typeMismatch' in input.validity &&
    'valid' in input.validity &&
    'valueMissing' in input.validity
  )
}
