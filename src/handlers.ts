export function registerGlobalHandlers(params: { onClose: () => unknown }): () => void {
  function handleFatal(err: any) {
    console.error('FATAL', err)
    process.exit(1)
  }

  function handleShutdown() {
    params.onClose()
  }

  process.addListener('uncaughtException', handleFatal)
  process.addListener('unhandledRejection', handleFatal)
  process.addListener('SIGINT', handleShutdown)
  process.addListener('SIGTERM', handleShutdown)

  return () => {
    process.removeListener('uncaughtException', handleFatal)
    process.removeListener('unhandledRejection', handleFatal)
    process.removeListener('SIGINT', handleShutdown)
    process.removeListener('SIGTERM', handleShutdown)
  }
}
