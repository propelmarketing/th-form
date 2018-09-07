((context) => {
  const DEFAULTS = {
    action: '//krool.thrivehive.com/webform/directFormHandler',
    mappedInputs: []
  }

  const REQUEST_HEADERS = [
    'Content-Type',
    'application/x-www-form-urlencoded'
  ]

  const INPUT_RULES = {
    email: {
      type: 'email'
    },
    phone: {
      type: 'tel',
      pattern: '[\\d\\s\\(\\)\\-\\+]*'
    },
    zip: {
      pattern: '[\\d\\s\\-]*'
    }
  }

  const STYLES = {
    error_color: '#FF0000',
    success_color: '#00FF00'
  }

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
        throw new Error('Unable to bind ThriveHive form, missing catracker.js')
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
        this.addHiddenInputs
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
      $wrapper.classList.add('form-wrapper')
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
        const rules = getInputRules($input.name)
        for (let key in rules) {
          $input.setAttribute(key, rules[key])
        }
      })
      return $el
    }

    addContainers($el) {
      this.$success = document.createElement('div')
      this.$success.classList.add('th-form-message', 'success-container')
      this.$success.innerHTML = 'Thanks! Your message has been received!'
      this.$success.style.color = STYLES.success_color
      this.hideElement(this.$success)

      this.$error = document.createElement('div')
      this.$error.classList.add('th-form-message', 'error-container')
      this.$error.innerHTML = 'Oops! There was a problem submitting your message'
      this.$error.style.color = STYLES.error_color
      this.hideElement(this.$error)

      this.$loading = document.createElement('div')
      this.$loading.classList.add('th-form-loading')
      this.$loading.innerHTML = 'Loading...'
      this.hideElement(this.$loading)

      $el.appendChild(this.$loading)
      $el.appendChild(this.$success)
      $el.appendChild(this.$error)
      return $el
    }

    showElement(...$els) {
      $els.map($el => {
        $el.style.visibility = 'visible'
      })
      return $els
    }

    hideElement(...$els) {
      $els.map($el => {
        $el.style.visibility = 'hidden'
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

    appendToParent($el) {
      this.$form.parentNode.appendChild($el)
      return $el
    }

    removeOriginalForm() {
      this.$form.parentNode.removeChild(this.$form)
      return this
    }

    getFormData() {
      const data = new FormData(this.$clone)
      return urlencodeFormData(data)
    }

    request(url, method = 'GET', data) {
      return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
        request.open(method, url)
        request.setRequestHeader(...REQUEST_HEADERS)
        request.send(data)
        request.addEventListener('load', resolve)
        request.addEventListener('error', reject)
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

  function includes(arrOrString, value) {
    return arrOrString.indexOf(value) !== -1
  }

  function getInputRules(name) {
    const key = Object.keys(INPUT_RULES).find(rule => {
      return includes(name, rule)
    })
    return INPUT_RULES[key] || {}
  }

  function encode(s) {
    return encodeURIComponent(s).replace(/%20/g, '+')
  }

  function urlencodeFormData(formdata) {
    const tuples = [...formdata.entries()]
    return tuples
      .map(tuple => {
        return tuple
          .map(item => encode(item))
          .join('=')
      })
      .join('&')
  }

  context.THForm = THForm
})(window)
