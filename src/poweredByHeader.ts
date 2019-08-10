import { SPAServerConfig } from './types'
import { Request, Response } from 'express'

export function createPoweredByMiddleware(config: SPAServerConfig) {
  if (config.poweredBy) {
    return (req: Request, res: Response, next: () => unknown) => {
      res.removeHeader('X-Powered-By')
      res.removeHeader('Server')

      res.setHeader('X-Powered-By', ['SPA-PROD', 'Express'])

      next()
    }
  } else {
    return (req: Request, res: Response, next: () => unknown) => {
      res.removeHeader('X-Powered-By')
      res.removeHeader('Server')

      next()
    }
  }
}
