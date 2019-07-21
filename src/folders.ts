import express from 'express'
import { SPAServerConfig, CacheType } from './types'

function getMaxAge(cache: CacheType) {
  switch (cache) {
    case 'immutable':
      return 365 * 24 * 60 * 60 * 1000
    case 'long':
      return 7 * 24 * 60 * 60 * 1000
    case 'short':
      return 60 * 1000
    case 'none':
      return 0
  }
}

export function createFoldersRouter(config: SPAServerConfig) {
  const router = express.Router()

  if (config.folders) {
    for (const folder of config.folders) {
      const path = folder.path || '/'
      const cache = folder.cache || 'short'
      const maxAge = getMaxAge(cache)

      router.use(
        path,
        express.static(folder.root, {
          index: false,
          immutable: cache === 'immutable',
          maxAge: maxAge,
          cacheControl: cache === 'none' ? false : undefined,
        })
      )
    }
  }

  return router
}
