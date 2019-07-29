import express, { Request, Response } from 'express'
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

function hideSourceMaps(req: Request, res: Response, next: () => unknown) {
  if (/.+\.map$/.test(req.url)) {
    return res.status(403).end('Source maps are hidden')
  } else {
    return next()
  }
}

export function createFoldersRouter(config: SPAServerConfig) {
  const router = express.Router()

  if (config.sourceMaps === false) {
    router.use(hideSourceMaps)
  }

  if (config.folders) {
    for (const folder of config.folders) {
      const path = folder.path || '/'
      const cache = folder.cache || CacheType.Short
      const maxAge = getMaxAge(cache)

      router.use(
        path,
        express.static(folder.root, {
          index: false,
          immutable: cache === CacheType.Immutable,
          maxAge: maxAge,
          cacheControl: cache === CacheType.None ? false : undefined,
        })
      )
    }
  }

  return router
}
