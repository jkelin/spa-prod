import { Request, Response, Application } from 'express'
import { join } from 'path'
import * as express from 'express'
import { Server } from 'http'

export interface IRunningSPAServer {
  app: Application
  server: Server
}

export interface ISPAServerConfig {
  port: number
  distFolder: string
}

export async function createSPAProdServer(config: ISPAServerConfig): Promise<IRunningSPAServer> {
  const app = express()

  app.get(/^[^\.]*$/, (req: Request, res: Response): void => {
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.sendFile(join(config.distFolder, 'index.html'))
  })

  app.use(express.static(config.distFolder))

  const server = await new Promise<Server>(resolve => {
    const appServer = app.listen(config.port, () => {
      resolve(appServer)
    })
  })

  return {
    app,
    server,
  }
}
