'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var path_1 = require('path')
var fs_1 = require('fs')
function handleConfigOptionalArray(item, defaultValue) {
  switch (true) {
    case item === undefined || item === true:
      return [defaultValue]
    case item === null || item === false:
      return []
    case Array.isArray(item):
      return item
    default:
      return [item]
  }
}
exports.handleConfigOptionalArray = handleConfigOptionalArray
function handleConfigOptionalFunction(item, defaultValue) {
  switch (true) {
    case typeof item === 'function':
      return item()
    case typeof item === 'object':
      return item
    default:
      return defaultValue
  }
}
exports.handleConfigOptionalFunction = handleConfigOptionalFunction
function generateSPAServerConfig(opts) {
  return {
    port: opts.port,
    folders: [{ root: opts.root, path: '/' }],
    index: path_1.join(opts.root, 'index.html'),
  }
}
exports.generateSPAServerConfig = generateSPAServerConfig
function validateSPAServerConfig(config) {
  if (!config.index || !fs_1.existsSync(config.index)) {
    throw new Error('SPA server config `index` validation failed: index file does not exist')
  }
  if (config.folders) {
    for (var _i = 0, _a = config.folders; _i < _a.length; _i++) {
      var folder = _a[_i]
      if (!fs_1.existsSync(folder.root)) {
        throw new Error('SPA server config `folders` validation failed: path ' + folder.root + ' does not exist')
      }
    }
  }
}
exports.validateSPAServerConfig = validateSPAServerConfig
//# sourceMappingURL=util.js.map
