import { html } from 'common-tags'
import styles from './css/styles.scss'
import * as utils from '@/utils'
const template = html`
<div class="test1">
  Hello World
</div>
<div class="test2">
  Hello World
</div>
`
console.log(utils.htmlToNode(template))

export const stylesheet = () => {
  return html`
    <style>
      ${styles.toString()}
    </style>
  `
}

export const successMessage = (message) => {
  return html`
    <div class="th-form-validation message success">
      ${message}
    </div>
  `
}

export const errorMessage = (message) => {
  return html`
    <div class="th-form-validation message error">
      ${message}
    </div>
  `
}

export const warningMessage = (message) => {
  return html`
    <div class="th-form-validation message error">
      ${message}
    </div>
  `
}

const circles = new Array(12).fill(null)

export const loading = () => {
  return html`
    <div class="th-form-loading">
      ${circles.map((i, n) => `<div class="th-circle th-circle-${n + 1}"></div>`)}
    </div>
  `
}
