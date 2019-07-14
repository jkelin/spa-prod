import { join } from 'path'
import { Server } from 'http'
import { Request, Response, Application } from 'express'
import * as express from 'express'
import { ISPAServerConfig, validateSPAServerConfig } from './util'
import { createHealthcheckRouter } from './healthcheck'
import { createFoldersRouter } from './folders'

export interface IRunningSPAServer {
  readonly app: Application
  readonly server: Server
  readonly config: Readonly<ISPAServerConfig>
}

function startServer(app: Application, config: ISPAServerConfig) {
  return new Promise<Server>(resolve => {
    const appServer = app.listen(config.port, () => {
      resolve(appServer)
    })
  })
}

export async function createSPAServer(config: ISPAServerConfig): Promise<IRunningSPAServer> {
  const app = express()

  if (!config.silent) {
    console.info(`Creating spa-prod server with config`, config)
  }

  validateSPAServerConfig(config)

  app.use('/', createHealthcheckRouter(config))
  app.use('/', createFoldersRouter(config))
  app.get(/^[^\.]*$/, (req: Request, res: Response): void => {
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
