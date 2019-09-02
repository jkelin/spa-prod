import { SPAServerConfig } from './types'
import { Request, Response } from 'express'
import { generateIntegrityForFile, findFilesForConfigByPattern, IndexMiddleware } from './util'

export async function createSRIIndexMiddleware(config: SPAServerConfig): Promise<IndexMiddleware> {
  const files = await findFilesForConfigByPattern(config, '**/*')
  const integrities = await Promise.all(files.map(file => generateIntegrityForFile(file.file)))

  files.forEach((f, i) => (f.integrity = integrities[i]))

  return (req: Request, res: Response, $: CheerioStatic) => {
    $('script[src]').each((i, elem) => {
      const url = $(elem).attr('src')
      const file = files.find(x => x.path === url)

      if (file && file.integrity) {
        $(elem).attr('integrity', file.integrity)
      }
    })

    $('link[href]').each((i, elem) => {
      const url = $(elem).attr('href')
      const file = files.find(x => x.path === url)

      if (file && file.integrity) {
        $(elem).attr('integrity', file.integrity)
      }
    })
  }
}
