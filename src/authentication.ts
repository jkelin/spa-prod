import { SPAServerConfig } from './types'
import BasicAuth from 'express-basic-auth'
import { Request, Response } from 'express'

export function createAuthenticationMiddleware(config: SPAServerConfig) {
  if (config.username && config.password) {
    return BasicAuth({
      users: {
        [config.username]: config.password,
      },
    })
  } else {
    return (req: Request, res: Response, next: () => unknown) => next()
  }
}
