import { SPAServerConfig, SPAServerFolder } from './types'
import { Request, Response } from 'express'
import { findFilesForConfigByPattern, IndexMiddleware } from './util'

export async function createPrefetchIndexMiddleware(config: SPAServerConfig): Promise<IndexMiddleware> {
  const prefetchables = await findFilesForConfigByPattern(config, '**/*.{js,css}')

  return (req: Request, res: Response, $: CheerioStatic) => {
    for (const prefetchable of prefetchables.map(x => x.path)) {
      $('head').append(`<link rel="prefetch" href="${prefetchable}">`)
    }
  }
}
