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

export const warningMessage = (message) => {
  return html`
    <div class="th-form-validation message error">
      ${message}
    </div>
  `
}

export const loading = () => {
  return html`
    <div class="th-form-loading">
      <div class="th-circle1 th-circle"></div>
      <div class="th-circle2 th-circle"></div>
      <div class="th-circle3 th-circle"></div>
      <div class="th-circle4 th-circle"></div>
      <div class="th-circle5 th-circle"></div>
      <div class="th-circle6 th-circle"></div>
      <div class="th-circle7 th-circle"></div>
      <div class="th-circle8 th-circle"></div>
      <div class="th-circle9 th-circle"></div>
      <div class="th-circle10 th-circle"></div>
      <div class="th-circle11 th-circle"></div>
      <div class="th-circle12 th-circle"></div>
    </div>
  `
}
