# THForm

A class for instrumenting lead forms on ThriveHive customers' websites. To be used in conjunction
with the [ThriveHive Form Instrumentor Chrome extension](https://github.com/propelmarketing/form-instrumentor).

The chrome extension outputs a small script, to be added to the page with the customer's lead form. This script will create a new instance of THForm. For example:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  new window.THForm(
    '#thrivehive-form18892',
    '9823hdd83-b342-4521-5434-23ec3341f85c',
    {
      mappedInputs: [
        {
          name: 'list.email',
          newName: 'email',
          required: true
        },
        {
          name: 'list.last_name',
          newName: 'phone',
          required: true
        }
      ]
    }
  );
});
</script>
```

# Params

The constructor accepts the following 3 parameters:

### Selector \<string>

Any valid DOM selector for the form to be instrumented.

### Form ID \<string>

The corresponding ThriveHive form ID.

### Options \<object>

- **mappedInputs** \<array>
  - An array containing any changes to the form inputs

# Development

