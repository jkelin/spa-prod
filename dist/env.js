'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
function parseEnv(value) {
  if (value === undefined) {
    return undefined
  }
  if (value === '') {
    return ''
  }
  if (value === 'null') {
    return null
  }
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  if (!isNaN(parseFloat(value)) && isFinite(value)) {
    return parseFloat(value)
  }
  return value
}
function readEnvs(config) {
  if (!config.envs || config.envs.length === 0) {
    return {}
  }
  return config.envs.reduce(function(acc, cur) {
    acc[cur] = parseEnv(process.env[cur])
    return acc
  }, {})
}
exports.readEnvs = readEnvs
function injectEnvsIntoHtml(config, envs, html) {
  if (!config.envs || config.envs.length === 0) {
    return html
  }
  var encoded = Buffer.from(JSON.stringify(envs)).toString('base64')
  var script =
    '<script>' + (config.envsPropertyName || 'window.__env') + '=JSON.parse(atob("' + encoded + '"))</script>'
  return html.replace('<head>', '<head>' + script)
}
exports.injectEnvsIntoHtml = injectEnvsIntoHtml
//# sourceMappingURL=env.js.map
