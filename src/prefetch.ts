import { SPAServerConfig, MappedFileInfo, SPAServerFolder, IndexMiddleware } from './types'
import { Request, Response } from 'express'
import { findFilesForConfigByPattern } from './util'

export async function createPrefetchIndexMiddleware(config: SPAServerConfig): Promise<IndexMiddleware> {
  const prefetchables = await findFilesForConfigByPattern(config, '**/*.{js,css}')

  return (req: Request, res: Response, $: CheerioStatic) => {
    for (const prefetchable of prefetchables.map(x => x.path)) {
      $('head').append(`<link rel="prefetch" href="${prefetchable}">`)
    }
  }
}
