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
import { createIndexRouter } from './indexRouter'
import { createAuthenticationMiddleware } from './authentication'
import { createPoweredByMiddleware } from './poweredByHeader'
import { createCSPIndexMiddleware, createNonceMiddleware } from './csp'

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
  const config = await validateSPAServerConfig(baseConfig)

  const app = express()
  const basicAuth = createAuthenticationMiddleware(config)
  const poweredBy = createPoweredByMiddleware(config)
  const nonce = createNonceMiddleware(config)

  if (!config.silent) {
    app.use(morgan('combined'))
  }

  app.use(compression())
  app.use(
    helmet({
      hsts: false,
      hidePoweredBy: false,
    })
  )
  app.use(poweredBy)

  if (config.csp) {
    app.use(nonce)
  }

  app.use('/', createHealthcheckRouter(config))
  app.use('/', basicAuth, createFoldersRouter(config))
  app.use('/', basicAuth, await createIndexRouter(config))

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
