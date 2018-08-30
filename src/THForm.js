((context) => {
  const DEFAULTS = {
    action: '//krool.thrivehive.com/webform/directFormHandler',
    mappedInputs: []
  }

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

    addHiddenInputs() {
      const $form = this.$clone
      window.$util.SetFormHiddenID('CA-uid', $form.id)
      window.$util.SetFormSessionID('CA-sess', $form.id)
      window.$util.AddHiddenFieldInForm('meta.form-id', $form.id, this.form_id)
      window.$util.AddHiddenFieldInForm('meta.trackerid', $form.id, window.cat.GetTrackerID())
      return this
    }

    appendToParent($el) {
      this.$form.parentNode.appendChild($el)
      return $el
    }

    removeOriginalForm() {
      document.body.removeChild(this.$form)
      return this
    }

    getFormData() {
      const data = new FormData(this.$clone)
      return urlencodeFormData(data)
    }

    request(url, method = 'GET', data) {
      const request = new XMLHttpRequest()
      request.open(method, url)
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      request.send(data)
      return request
    }

    handleSubmit(e) {
      e.preventDefault()
      const data = this.getFormData()
      const request = this.request(this.options.action, 'POST', data)

      request.addEventListener('load', this.handleSuccess.bind(this))
      request.addEventListener('error', this.handleError.bind(this))
    }

    handleSuccess(e) {
      console.log('success', e)
    }

    handleError(e) {
      console.warn('error', e)
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
    let s = ''
    for (let pair of formdata.entries()) {
      if (typeof pair[1] === 'string') {
        s += (s ? '&' : '') + encode(pair[0]) + '=' + encode(pair[1])
      }
    }
    return s
  }

  context.THForm = THForm
})(window)
