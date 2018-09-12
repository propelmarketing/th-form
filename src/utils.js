/**
 * get rules that match input name
 *
 * @param {*} name
 * @param {*} rules
 * @returns Object
 */

export function getInputRules(name, rules) {
  const key = Object.keys(rules)
    .find(rule => name.includes(rule))
  return rules[key] || {}
}

/**
 * transform a template string into a dom node
 *
 * @param {*} html
 * @export
 */
export function htmlToNode(html) {
  const $wrap = document.createElement('div')
  $wrap.innerHTML = html
  const $content = $wrap.childNodes
  return $content.length > 1
    ? $content
    : $content[0]
}
