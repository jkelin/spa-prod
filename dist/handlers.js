'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
function registerGlobalHandlers(params) {
  function handleFatal(err) {
    console.error('FATAL', err)
    process.exit(1)
  }
  function handleShutdown() {
    params.onClose()
  }
  process.on('uncaughtException', handleFatal)
  process.on('unhandledRejection', handleFatal)
  process.on('SIGINT', handleShutdown)
  process.on('SIGTERM', handleShutdown)
  return function() {
    process.removeListener('uncaughtException', handleFatal)
    process.removeListener('unhandledRejection', handleFatal)
    process.removeListener('SIGINT', handleShutdown)
    process.removeListener('SIGTERM', handleShutdown)
  }
}
exports.registerGlobalHandlers = registerGlobalHandlers
//# sourceMappingURL=handlers.js.map
