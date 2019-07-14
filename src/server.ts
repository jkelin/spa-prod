import { Server } from 'http'
import { default as express, Request, Response, Application } from 'express'
import compression from 'compression'
import helmet from 'helmet'
import { SPAServerConfig, validateSPAServerConfig } from './util'
import { createHealthcheckRouter } from './healthcheck'
import { createFoldersRouter } from './folders'

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

export async function createSPAServer(config: SPAServerConfig): Promise<RunningSPAServer> {
  const app = express()

  if (!config.silent) {
    console.info(`Creating spa-prod server with config`, config)
  }

  validateSPAServerConfig(config)

  app.use(compression())
  app.use(
    helmet({
      hsts: false,
    })
  )

  app.use('/', createHealthcheckRouter(config))
  app.use('/', createFoldersRouter(config))
  app.get(/^[^.]*$/, (req: Request, res: Response): void => {
    res.sendFile(config.index, {
      maxAge: 60 * 1000,
    })
  })

  const server = await startServer(app, config)

  if (!config.silent) {
    console.info(`Listening on address`, (server.address() as any).address, 'port', (server.address() as any).port)
  }

  return {
    app,
    server,
    config,
  }
}
