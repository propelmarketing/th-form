import serialize from 'form-serialize'
import * as templates from './templates'
import * as utils from './utils'
import {
  DEFAULTS,
  INPUT_TAGS,
  MESSAGES
} from './constants'

((context) => {
  /**
   * Instrument customer lead forms in-place
   *
   * @class THForm
   */
  class THForm {
    /**
     * Creates an instance of THForm.
     * @param {*} selector
     * @param {*} form_id
     * @param {*} [options={}]
     * @memberof THForm
     */
    constructor(selector, form_id, options = {}) {
      this.options = Object.assign({}, DEFAULTS, options)
      this.selector = selector
      this.form_id = form_id
      this.init()
    }

    async init() {
      await utils.ready(this.options.delay)
      this.checkForTrackingScript()
      this.setValidationMode()
      this.takeControlOfForm()
    }

    checkForTrackingScript() {
      if (!window.CATracker || !window.cat || !window.$util) {
        throw new ReferenceError(MESSAGES.catracker)
      }
    }

    setValidationMode() {
      if (!utils.testValidationSupport()) {
        this.options.customValidation = true
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
        this.addMessages,
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
      const action = this.options.customValidation
        ? 'set'
        : 'remove'
      $el[`${action}Attribute`]('novalidate', true)
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
        const rules = utils.getInputRules($input.name, true)
        for (let key in rules) {
          $input.setAttribute(key, rules[key])
        }
      })
      return $el
    }

    addMessages($el) {
      const messages = {
        $success: utils.htmlToNode(
          templates.successMessage(MESSAGES.success)
        ),
        $error: utils.htmlToNode(
          templates.errorMessage(MESSAGES.error)
        ),
        $warning: utils.htmlToNode(
          templates.errorMessage(MESSAGES.error)
        ),
        $loading: utils.htmlToNode(
          templates.loading(MESSAGES.loading)
        )
      }
      Object.assign(this, messages)
      // Object.keys(messages).map(key => {
      //   $el.appendChild(...this.hideElement(messages[key]))
      // })
      utils.appendChild($el, ...this.hideElement(...Object.values(messages)))
      // utils.appendChild($el, ...this.hideElement())
      // this.$success = utils.htmlToNode(
      //   templates.successMessage(MESSAGES.success)
      // )
      // this.$error = utils.htmlToNode(
      //   templates.errorMessage(MESSAGES.error)
      // )
      // this.$warning = utils.htmlToNode(
      //   templates.errorMessage(MESSAGES.error)
      // )
      // this.$loading = utils.htmlToNode(
      //   templates.loading('Loading...')
      // )

      // $el.appendChild(...this.hideElement(this.$success))
      // $el.appendChild(...this.hideElement(this.$error))
      // $el.appendChild(...this.hideElement(this.$warning))
      // $el.appendChild(...this.hideElement(this.$loading))

      return $el
    }

    showElement(...$els) {
      $els.map($el => {
        $el.classList.remove('hidden')
      })
      return $els
    }

    hideElement(...$els) {
      $els.map($el => {
        $el.classList.add('hidden')
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

    async handleSubmit(e) {
      e.preventDefault()
      this.hideElement(this.$success, this.$error, this.$warning)
      const passed = this.validateAll()
      if (passed) {
        const data = this.getFormData()
        this.showElement(this.$loading)
        await utils.sleep(2000)
        utils.request(this.options.action, 'POST', data)
          .then((e) => {
            this.handleSuccess(e)
          })
          .catch((e) => {
            this.handleError(e)
          })
          .then(this.hideElement(this.$loading))
      }
    }

    handleSuccess(e) {
      this.showElement(this.$success)
    }

    handleError(e) {
      this.showElement(this.$error)
    }

    validateAll() {
      if (this.options.customValidation) {
        const $inputs = this.$clone.querySelectorAll(INPUT_TAGS.join())
        let first_error = null
        const all_passed = [...$inputs].reduce((acc, $input) => {
          const validity = this.validateEach($input)
          if (!validity.value && !first_error) {
            first_error = validity
          }
          acc = validity.value
            ? acc
            : false
          return acc
        }, true)
        if (!all_passed) {
          const template = templates.warningMessage(first_error.message)
          this.$warning = utils.replaceNode(this.$warning, template)
          this.showElement(this.$warning)
        }
        return all_passed
      } else {
        return true
      }
    }

    validateEach($input) {
      const { value, required } = $input
      if (required || value) {
        const name = $input.name.toLowerCase()
        const passed = required && !value
          ? {
            value: false,
            message: `The ${name} field is required.` }
          : this.validate($input)
        return passed
      } else {
        return {
          value: true
        }
      }
    }

    validate($input) {
      const rules = utils.getInputRules($input.name)
      let passed = {
        value: true
      }
      if (rules) {
        const { value } = $input
        const { pattern, test } = rules
        if (pattern) {
          const regex = new RegExp(pattern)
          passed.value = regex.test(value)
        }
        if (test) {
          passed.value = test(value)
        }
        passed.message = rules.message
      }
      return passed
    }
  }

  context.THForm = THForm
})(window)
