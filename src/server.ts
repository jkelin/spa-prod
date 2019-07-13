import { join } from 'path'
import { Server } from 'http'
import { Request, Response, Application } from 'express'
import * as express from 'express'
import { ISPAServerConfig } from './util'
import { createHealthcheck } from './healthcheck'

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

  app.use('/', createHealthcheck(config))
  app.get(/^[^\.]*$/, (req: Request, res: Response): void => {
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.sendFile(join(config.distFolder, 'index.html'))
  })

  app.use(express.static(config.distFolder))

  const server = await startServer(app, config)
  console.info('Listening on port', config.port)

  return {
    app,
    server,
    config,
  }
}
