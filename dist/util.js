'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
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
