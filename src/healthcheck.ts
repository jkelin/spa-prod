import * as express from 'express'
import {
  ISPAServerConfig,
  handleConfigOptionalArray,
  ISPAServerHealthcheckConfig,
  handleConfigOptionalFunction,
} from './util'
import { Request, Response } from 'express'

function generateHealthcheck() {
  return {
    status: 'ok',
    now: new Date().toISOString(),
  }
}

export function createHealthcheckRouter(config: ISPAServerConfig) {
  const router = express.Router()

  if (config.healthcheck !== false || config.healthcheck !== null) {
    const healthchecks = handleConfigOptionalArray<ISPAServerHealthcheckConfig>(config.healthcheck, {
      path: '/healthz',
    })

    for (const hc of healthchecks) {
      router.get(hc.path, (req: Request, res: Response): void => {
        const data = handleConfigOptionalFunction(hc.data, generateHealthcheck())

        res.json(data)
      })
    }
  }

  return router
}
