# THForm

A class for instrumenting lead forms on ThriveHive customers' websites. To be used in conjunction
with the [ThriveHive Form Instrumentor Chrome extension](https://github.com/propelmarketing/form-instrumentor).

The chrome extension outputs a small script, to be added to the page with the customer's lead form. This script will create a new instance of THForm. For example:

```html
<script>
new THForm(
  '#thrivehive-form18892',
  '9823hdd83-b342-4521-5434-23ec3341f85c',
  {
    mappedInputs: [
      {
        name: 'email_address',
        newName: 'email',
        required: true
      },
      {
        name: 'fname',
        newName: 'first_name'
      }
    ]
  }
);
</script>
```

# Dependencies

In order to properly track forms, THForm currently depends on `catracker.js` being initialized beforehand. THForm has no other dependencies.

# Browser Support

The project is transpiled to es5 by `webpack` / `babel`, with `@babel/polyfill` and `@babel/env` set to target the following browsers:

- Chrome >= 52
- FireFox >= 44
- Safari >= 7
- Internet Explorer 11
- last 4 Edge versions

SCSS is transpiled to CSS via `node-sass` and autoprefixed by `postcss` and `autoprefixer` per the following settings:

- stage: 3
- browsers: ['cover 99.5%', '> 5%']

# Parameters

The constructor accepts the following 3 parameters:

### `selector`
<code><b>type:</b> string</code>  
<code><b>default:</b> undefined</code>

DOM selector for the form to be instrumented.

### `form_id`
<code><b>type:</b> string</code>  
<code><b>default:</b> null</code>

The corresponding ThriveHive form ID.

### `options`
<code><b>type:</b> object</code>  
<code><b>default:</b> undefined</code>

Accepts the following values:

- ### **`customValidation`**
  <code><b>type:</b> boolean</code>  
  <code><b>default:</b> false</code>

  Default is `false`. The form will be validated via the built-in browser    `ValidityState` API by default, but will use a fallback validation system if `ValidityState` is not supported by the browser, or if the `customValidation` parameter is set to `true`. This option should be used if the customer wants to control the style of the validation messages.

- ### **`delay`**
  <code><b>type:</b> number</code>  
  <code><b>default:</b> 0</code>
  
  Number of milliseconds to delay initialization. This was added to solve a problem created by Wix replacing the DOM shortly after the page loads, which can be worked around by adding a 1000ms delay.

- ### **`poll`**
  <code><b>type:</b> boolean</code>  
  <code><b>default:</b> false</code>

  This option will configure the class to start polling to try to find the form, and will continue until the form is present on the page. This is useful for cases where the form is not present when the DOM loads, and is added asynchronously.

- ### **`pollInterval`**
  <code><b>type:</b> number</code>  
  <code><b>default:</b> 1000</code>
  
  How frequently to poll in milliseconds

- ### **`mappedInputs`**
  <code><b>type:</b> array</code>  
  <code><b>default:</b> undefined</code>

  An array containing any changes to the form inputs

- ### **`onSubmit`**
  <code><b>type:</b> function</code>  
  <code><b>default:</b> undefined</code>

  Callback for form submission. This will fire anytime the form is submitted, regardless of response.

- ### **`onSuccess`**
  <code><b>type:</b> function</code>  
  <code><b>default:</b> undefined</code>

  Callback for successful form submission. This will prevent the default message from being shown.

- ### **`onError`**
  <code><b>type:</b> function</code>  
  <code><b>default:</b> undefined</code>

  Callback for failed form submission. This will prevent the default message from being shown.

# Development

Start webpack dev server by running `npm start`, and go to the port specified, default is 6600.

```bash
npm start
```
Custom port:
```bash
PORT=6002 npm start
```

# Production

`npm run build` will run the webpack production build, and prod-ready bundles will write to the `./dist` folder. To deploy to Amazon S3, tag the release with a pre-release or a release version:

| Environment | Syntax   | Bucket       |
|-------------|----------|--------------|
| QA          | v1.1.1QA | qa-th-form   |
| Production  | v1.1.1   | prod-th-form |

Use `npm version` to increment, but since the QA syntax deviates from semver, QA releases must be tagged manually via `git tag -a v1.1.1QA`

Deployment to S3 will begin after pushing a new release tag `git push && git push --tags`, and drafting the release on GitHub.

## Testing

The project uses Jest for regular unit tests, and jest-puppeteer for UI unit testing.

Run unit tests:
```bash
npm test
```
Run UI tests:
```bash
npm run puppeteer
```

## Versioning
This project uses [semver](https://semver.org/). Use `npm version major|minor|patch -m <message>` to increment version depending on the changes.