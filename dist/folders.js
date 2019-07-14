'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var express_1 = __importDefault(require('express'))
function getMaxAge(cache) {
  switch (cache) {
    case 'immutable':
      return 365 * 24 * 60 * 60 * 1000
    case 'long':
      return 7 * 24 * 60 * 60 * 1000
    case 'short':
      return 60 * 1000
    case 'none':
      return 0
  }
}
function createFoldersRouter(config) {
  var router = express_1.default.Router()
  if (config.folders) {
    for (var _i = 0, _a = config.folders; _i < _a.length; _i++) {
      var folder = _a[_i]
      var path = folder.path || '/'
      var cache = folder.cache || 'short'
      var maxAge = getMaxAge(cache)
      router.use(
        path,
        express_1.default.static(folder.root, {
          index: false,
          immutable: cache === 'immutable',
          maxAge: maxAge,
          cacheControl: cache === 'none' ? false : undefined,
        })
      )
    }
  }
  return router
}
exports.createFoldersRouter = createFoldersRouter
//# sourceMappingURL=folders.js.map
