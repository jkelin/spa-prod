import { SPAServerConfig, SPAServerFolder } from './types'
import { parseEnv } from './util'
import express, { Request, Response } from 'express'
import { promisify } from 'util'
import { readFile, stat } from 'fs'
import glob from 'glob-promise'
import { join } from 'path'
import { flatMap, uniq } from 'lodash'

const readFileAsync = promisify(readFile)
const statAsync = promisify(stat)

export function readEnvs(config: SPAServerConfig): Record<string, any> {
  if (!config.envs || config.envs.length === 0) {
    return {}
  }

  return config.envs.reduce<Record<string, any>>((acc, cur) => {
    acc[cur] = parseEnv(process.env[cur])
    return acc
  }, {})
}

export function injectEnvsIntoHtml(config: SPAServerConfig, envs: Record<string, any>, html: string) {
  if (!config.envs || config.envs.length === 0) {
    return html
  }

  const encoded = Buffer.from(JSON.stringify(envs)).toString('base64')
  const script = `<script>${config.envsPropertyName || 'window.__env'}=JSON.parse(atob("${encoded}"))</script>`

  return html.replace('<head>', `<head>${script}`)
}

export async function findFilesToPrefetch(root: string): Promise<string[]> {
  const stat = await statAsync(root)

  if (!stat.isDirectory()) {
    return []
  }

  return (await glob('**/*.{js,css}', { cwd: root, nodir: true }))
    .map(x => join('/', x))
    .map(x => x.replace(/\\/g, '/'))
}

export async function findFilesToPrefetchForPaths(folders: SPAServerFolder[]): Promise<string[]> {
  const filesByFolder = await Promise.all(folders.map(f => findFilesToPrefetch(f.root)))
  const filesWithPaths = folders.map((folder, i) => filesByFolder[i].map(file => join(folder.path!, file)))

  return uniq(flatMap(filesWithPaths)).map(x => x.replace(/\\/g, '/'))
}

export function injectPrefetchTagsIntoHtml(config: SPAServerConfig, paths: string[], html: string) {
  if (!config.prefetch) {
    return html
  }

  const tags = paths.map(x => `<link rel="prefetch" href="${x}">`).join('\n')

  return html.replace('</head>', `${tags}\n</head>`)
}

export async function createIndexRouter(config: SPAServerConfig) {
  const router = express.Router()

  const baseIndex = (await readFileAsync(config.index!)).toString('utf-8')
  const prefetchables = config.folders
    ? await findFilesToPrefetchForPaths(config.folders)
    : await findFilesToPrefetch(config.root!)

  router.get(/^[^.]*$/, (req: Request, res: Response): void => {
    let index = baseIndex

    index = injectEnvsIntoHtml(config, readEnvs(config), index)
    index = injectPrefetchTagsIntoHtml(config, prefetchables, index)

    res.setHeader('Cache-Control', 'public, max-age=60')
    res.send(index)
  })

  return router
}
