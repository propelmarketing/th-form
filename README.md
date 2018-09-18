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
        name: 'name',
        newName: 'first_name',
        required: true
      }
    ]
  }
);
</script>
```

# Dependencies

In order to properly track forms, THForm currently depends on `catracker.js` being initialized beforehand. THForm has no other dependencies.

# Params

The constructor accepts the following 3 parameters:

### Selector \<string>

Any valid DOM selector for the form to be instrumented.

### Form ID \<string>

The corresponding ThriveHive form ID.

### Options \<object>

- **delay** \<number>
  - Number of milliseconds to delay initialization. This was added to solve a problem created by Wix replacing the DOM when the page loads, which can be worked around by added a 1000ms delay.
- **mappedInputs** \<array>
  - An array containing any changes to the form inputs

# Development

Start webpack dev server by running `npm start`, and go to the port specified, default is 6600. This
can be changed via the `PORT` environment variable.

# Production

`npm run build` will run the webpack production build, and prod-ready bundles will write to the `./dist` folder. To deploy to Amazon S3, tag the release with a pre-release or a release version:

| Environment | Syntax   | Bucket       |
|-------------|----------|--------------|
| QA          | v1.1.1QA | qa-th-form   |
| Production  | v1.1.1   | prod-th-form |

You may use `npm version` to increment, but since the QA syntax deviates from semver, QA releases must be tagged manually via `git tag -a v1.1.1QA`

Deployment to S3 will begin after pushing a new release tag `git push && git push --tags`, and drafting the release on GitHub.

