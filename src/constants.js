export const DEFAULTS = {
  action: '//krool.thrivehive.com/webform/directFormHandler',
  mappedInputs: []
}

export const REQUEST_HEADERS = [
  'Content-Type',
  'application/x-www-form-urlencoded'
]

export const MESSAGES = {
  success: 'Thanks! Your message has been received!',
  error: 'Oops! There was a problem submitting your message',
  catracker: 'Unable to track form, missing catracker.js. ' +
    'https://my.thrivehive.com/#settings/tracking/tracking-code'
}

export const INPUT_RULES = {
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
