import { SPAServerConfig } from './types'
import express, { Request, Response } from 'express'
import { promisify } from 'util'
import { readFile } from 'fs'
import { createCSPIndexMiddleware, createNonceIndexMiddleware } from './csp'
import cheerio from 'cheerio'
import { createSRIIndexMiddleware } from './sri'
import { createENVsIndexMiddleware } from './envs'
import { createPrefetchIndexMiddleware } from './prefetch'
import { IndexMiddleware } from './util'

const readFileAsync = promisify(readFile)

export async function createIndexRouter(config: SPAServerConfig) {
  const router = express.Router()

  const baseIndex = (await readFileAsync(config.index!)).toString('utf-8')

  const enabledMiddleware: Promise<IndexMiddleware>[] = [
    config.csp && createNonceIndexMiddleware(config),
    config.envs && config.envs.length > 0 && createENVsIndexMiddleware(config),
    config.prefetch && createPrefetchIndexMiddleware(config),
    config.sri && createSRIIndexMiddleware(config),
    config.csp && createCSPIndexMiddleware(config),
  ].filter(Boolean) as any

  const middleware = await Promise.all(enabledMiddleware)

  router.get(/^[^.]*$/, (req: Request, res: Response): void => {
    const $ = cheerio.load(baseIndex)

    middleware.forEach(x => x(req, res, $))

    res.setHeader('Cache-Control', 'public, max-age=60')
    res.header('Content-Type', 'text/html; charset=utf-8')

    res.send($.html())
  })

  return router
}
