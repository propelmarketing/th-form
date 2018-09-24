import isEmail from 'validator/lib/isEmail'

export const DEFAULTS = {
  action: '//my.thrivehive.com/webform/directFormHandler',
  delay: 0,
  poll: false,
  pollInterval: 1000,
  debug: false,
  customValidation: false,
  mappedInputs: []
}

export const REQUEST_HEADERS = [
  {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
]

export const MESSAGES = {
  required: 'This field is required',
  requiredNamed: name => `The ${name} field is required.`,
  success: 'Thanks! Your message has been received!',
  error: 'Oops! There was a problem submitting your message',
  catracker: 'Unable to track form, missing catracker.js. ' +
    'https://my.thrivehive.com/#settings/tracking/tracking-code'
}

export const INPUT_RULES = {
  email: {
    type: 'email',
    test: isEmail,
    title: 'Please enter a valid email address'
  },
  phone: {
    type: 'tel',
    pattern: '^[\\d\\s\\(\\)\\-\\+]*$',
    title: 'Please enter a valid phone number'
  },
  zip: {
    pattern: '^[\\d\\s\\-]*$',
    title: 'Please enter a valid postal code'
  }
}

export const INPUT_TAGS = [
  'input',
  'select',
  'textarea'
]

export const EXCLUDED_ATTRIBUTES = [
  'test'
]
