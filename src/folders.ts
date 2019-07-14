import * as express from 'express'
import { ISPAServerConfig } from './util'

export function createFoldersRouter(config: ISPAServerConfig) {
  const router = express.Router()

  if (config.folders) {
    for (const folder of config.folders) {
      router.use(folder.path || '/', express.static(folder.root, {}))
    }
  }

  return router
}
