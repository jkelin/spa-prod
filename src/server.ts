import { Server } from 'http'
import { default as express, Request, Response, Application } from 'express'
import compression from 'compression'
import helmet from 'helmet'
import morgan from 'morgan'
import { SPAServerConfig, validateSPAServerConfig } from './util'
import { createHealthcheckRouter } from './healthcheck'
import { createFoldersRouter } from './folders'
import { readEnvs, injectEnvsIntoHtml } from './env'
import { promisify } from 'util'
import { readFile } from 'fs'
import { registerGlobalHandlers } from './handlers'

const readFileAsync = promisify(readFile)

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

  validateSPAServerConfig(config)

  if (!config.silent) {
    app.use(morgan('combined'))
  }

  const index = (await readFileAsync(config.index)).toString('utf-8')

  app.use(compression())
  app.use(
    helmet({
      hsts: false,
    })
  )

  app.use('/', createHealthcheckRouter(config))
  app.use('/', createFoldersRouter(config))
  app.get(/^[^.]*$/, (req: Request, res: Response): void => {
    const envs = readEnvs(config)
    const injectedIndex = injectEnvsIntoHtml(config, envs, index)

    res.setHeader('Cache-Control', 'public, max-age=60')
    res.send(injectedIndex)
  })

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
