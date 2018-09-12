import { html } from 'common-tags'
import styles from './css/styles.scss'

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

export const loading = (message) => {
  return html`
    <div class="th-form-loading">
      ${message}
    </div>
  `
}
