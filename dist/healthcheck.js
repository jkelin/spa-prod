'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var express_1 = __importDefault(require('express'))
var util_1 = require('./util')
function generateHealthcheck() {
  return {
    status: 'ok',
    now: new Date().toISOString(),
  }
}
function createHealthcheckRouter(config) {
  var router = express_1.default.Router()
  if (config.healthcheck !== false || config.healthcheck !== null) {
    var healthchecks = util_1.handleConfigOptionalArray(config.healthcheck, {
      path: '/healthz',
    })
    var _loop_1 = function(hc) {
      router.get(hc.path, function(req, res) {
        var data = util_1.handleConfigOptionalFunction(hc.data, generateHealthcheck())
        res.json(data)
      })
    }
    for (var _i = 0, healthchecks_1 = healthchecks; _i < healthchecks_1.length; _i++) {
      var hc = healthchecks_1[_i]
      _loop_1(hc)
    }
  }
  return router
}
exports.createHealthcheckRouter = createHealthcheckRouter
//# sourceMappingURL=healthcheck.js.map
