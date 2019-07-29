import { Server } from 'http'
import { default as express, Application } from 'express'
import compression from 'compression'
import helmet from 'helmet'
import morgan from 'morgan'
import { validateSPAServerConfig } from './util'
import { createHealthcheckRouter } from './healthcheck'
import { createFoldersRouter } from './folders'
import { registerGlobalHandlers } from './handlers'
import { SPAServerConfig } from './types'
import { applyPresets } from './presets'
import { createIndexRouter } from './indexRouter'

export interface RunningSPAServer {
  readonly app: Application
  readonly server: Server
  readonly config: Readonly<SPAServerConfig>
}

function startServer(app: Application, config: SPAServerConfig) {
  return new Promise<Server>(resolve => {
    const appServer = app.listen(config.port, () => {
      resolve(appServer)
    })
  })
}

export async function createSPAServer(baseConfig: SPAServerConfig): Promise<RunningSPAServer> {
  validateSPAServerConfig(baseConfig)
  const config = await applyPresets(baseConfig)

  const app = express()

  if (!config.silent) {
    app.use(morgan('combined'))
  }

  app.use(compression())
  app.use(
    helmet({
      hsts: false,
    })
  )

  app.use('/', createHealthcheckRouter(config))
  app.use('/', createFoldersRouter(config))
  app.use('/', await createIndexRouter(config))

  const server = await startServer(app, config)

  if (!config.silent) {
    console.info(`Listening on address`, (server.address() as any).address, 'port', (server.address() as any).port)
  }

  const cleanHandlers = registerGlobalHandlers({ onClose: () => server.close() })

  server.on('close', cleanHandlers)

  return {
    app,
    server,
    config,
  }
}
