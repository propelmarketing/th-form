import serialize from 'form-serialize'
import * as templates from './templates'
import * as utils from './utils'
import {
  DEFAULTS,
  REQUEST_HEADERS,
  INPUT_RULES,
  MESSAGES
} from './constants'

((context) => {
  class THForm {
    constructor(selector, form_id, options = {}) {
      this.options = Object.assign({}, DEFAULTS, options)
      this.selector = selector
      this.form_id = form_id
      this.init()
    }

    init() {
      this.checkForTrackingScript()
      this.takeControlOfForm()
    }

    checkForTrackingScript() {
      if (!window.CATracker || !window.cat || !window.$util) {
        throw new ReferenceError(MESSAGES.catracker)
      }
    }

    takeControlOfForm() {
      return this.compose(
        this.bindForm,
        this.cloneForm,
        this.setFormAttributes,
        this.resetRequired,
        this.mapInputs,
        this.convertInputs,
        this.addContainers,
        this.bindEventListeners,
        this.wrapForm,
        this.unbindInlineEvents,
        this.appendToParent,
        this.removeOriginalForm,
        this.addHiddenInputs,
        this.injectStylesheet
      )()
    }

    compose(...fns) {
      return fns.reduceRight((f, g) => (...args) => f.call(this, g.call(this, ...args)))
    }

    bindForm() {
      this.$form = document.querySelector(this.selector)
      return this.$form
    }

    bindEventListeners($el) {
      $el.addEventListener('submit', this.handleSubmit.bind(this))
      return $el
    }

    unbindInlineEvents($el) {
      const $all = $el.querySelectorAll('*')
      for (let $element of $all) {
        const inlineEventListeners = [...$element.attributes]
          .map(({ name }) => name)
          .filter(name => {
            return /^on/i.test(name)
          })
        inlineEventListeners.map(attr => {
          $element.removeAttribute(attr)
        })
      }
      return $el
    }

    cloneForm($el) {
      this.$clone = $el.cloneNode(true)
      return this.$clone
    }

    wrapForm($el) {
      const $wrapper = document.createElement('div')
      $wrapper.classList.add('th-form-wrapper')
      $wrapper.appendChild($el)
      return $wrapper
    }

    setFormAttributes($el) {
      $el.setAttribute('action', this.options.action)
      $el.removeAttribute('novalidate')
      this.setFormId($el)
      return $el
    }

    setFormId($el) {
      if (!$el.id) {
        $el.id = `thrivehive-form-${(new Date()).getTime()}`
      }
      return $el
    }

    resetRequired($el) {
      $el.querySelectorAll('input')
        .forEach($input => {
          $input.required = false
        })
      return $el
    }

    mapInputs($el) {
      const mappedInputs = this.options.mappedInputs
      if (mappedInputs.length) {
        mappedInputs.map(input => {
          const $input = $el.querySelector(`[name="${input.name}"]`)
          if ($input) {
            if ('newName' in input) {
              $input.name = input.newName
            }
            if ('required' in input) {
              $input.required = input.required
            }
          }
        })
      }
      return $el
    }

    convertInputs($el) {
      const $inputs = $el.querySelectorAll('input')
      $inputs.forEach($input => {
        const rules = utils.getInputRules($input.name, INPUT_RULES)
        for (let key in rules) {
          $input.setAttribute(key, rules[key])
        }
      })
      return $el
    }

    addContainers($el) {
      this.$success = utils.htmlToNode(
        templates.successMessage(MESSAGES.success)
      )
      this.$error = utils.htmlToNode(
        templates.errorMessage(MESSAGES.error)
      )
      this.$loading = utils.htmlToNode(
        templates.loading('Loading...')
      )

      this.hideElement(this.$success)
      this.hideElement(this.$error)
      this.hideElement(this.$loading)

      $el.appendChild(this.$loading)
      $el.appendChild(this.$success)
      $el.appendChild(this.$error)

      return $el
    }

    showElement(...$els) {
      $els.map($el => {
        $el.classList.remove('hidden')
        // $el.style.display = 'block'
      })
      return $els
    }

    hideElement(...$els) {
      $els.map($el => {
        $el.classList.add('hidden')
        // $el.style.display = 'none'
      })
      return $els
    }

    addHiddenInputs() {
      const $form = this.$clone
      const $util = window.$util
      const tracker_id = window.cat.GetTrackerID()
      $util.SetFormHiddenID('CA-uid', $form.id)
      $util.SetFormSessionID('CA-sess', $form.id)
      $util.AddHiddenFieldInForm('meta.form-id', $form.id, this.form_id)
      $util.AddHiddenFieldInForm('meta.trackerid', $form.id, tracker_id)
      return this
    }

    injectStylesheet() {
      this.$clone.parentNode.appendChild(
        utils.htmlToNode(
          templates.stylesheet()
        )
      )
    }

    appendToParent($el) {
      this.$form.parentNode.appendChild($el)
      return $el
    }

    removeOriginalForm() {
      this.$form.parentNode.removeChild(this.$form)
      return this
    }

    getFormData() {
      return serialize(this.$clone)
    }

    request(url, method = 'GET', data) {
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

    handleSubmit(e) {
      e.preventDefault()
      this.hideElement(this.$success, this.$error)
      const data = this.getFormData()
      this.showElement(this.$loading)
      this.request(this.options.action, 'POST', data)
        .then((e) => {
          this.handleSuccess(e)
        })
        .catch(() => {
          this.handleError(e)
        })
        .then(this.hideElement(this.$loading))
    }

    handleSuccess(e) {
      console.log('success', e)
      this.showElement(this.$success)
    }

    handleError(e) {
      console.warn('error', e)
      this.showElement(this.$error)
    }
  }

  context.THForm = THForm
})(window)
