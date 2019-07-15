import { join } from 'path'
import { existsSync } from 'fs'

export type ConfigOptionalArray<T> = undefined | null | false | true | T | T[]

export type CacheType = 'none' | 'short' | 'long' | 'immutable'

export interface SPAServerHealthcheckConfig {
  /**
   * HTTP path on which to serve this healthcheck endpoint
   */
  path: string

  /**
   * Object containing data to serve on this endpoint or a function to generate said data
   */
  data?: any | (() => any)
}

export interface SPAServerFolder {
  /**
   * Path of the folder
   */
  root: string

  /**
   * HTTP path from which to server this folder
   * @default /
   */
  path?: string

  /**
   * Caching longevity
   * @default "short"
   */
  cache?: CacheType
}

export interface SPAServerConfig {
  /**
   * Listen port
   */
  port: number

  /**
   * Folders to serve
   */
  folders?: SPAServerFolder[]

  /**
   * Index.html file path
   */
  index: string

  /**
   * Healthcheck endpoint configuration
   */
  healthcheck?: ConfigOptionalArray<SPAServerHealthcheckConfig>

  /**
   * Should logs be printed?
   */
  silent?: boolean

  /**
   * Whitelisted environment variables to be injected into index and served from healthcheck
   */
  envs?: string[]

  /**
   * Property to inject envs into
   * @default "window.__env"
   */
  envsPropertyName?: string
}

export function handleConfigOptionalArray<T>(item: ConfigOptionalArray<T>, defaultValue: T): T[] {
  switch (true) {
    case item === undefined || item === true:
      return [defaultValue]
    case item === null || item === false:
      return []
    case Array.isArray(item):
      return item as T[]
    default:
      return [item as T]
  }
}

export function handleConfigOptionalFunction<T>(item: undefined | T | (() => T), defaultValue: T): T {
  switch (true) {
    case typeof item === 'function':
      return (item as () => T)()
    case typeof item === 'object':
      return item as T
    default:
      return defaultValue
  }
}

export function generateSPAServerConfig(opts: { root: string; port: number }): SPAServerConfig {
  return {
    port: opts.port,
    folders: [{ root: opts.root, path: '/' }],
    index: join(opts.root, 'index.html'),
  }
}

export function validateSPAServerConfig(config: SPAServerConfig) {
  if (!config.index || !existsSync(config.index)) {
    throw new Error('SPA server config `index` validation failed: index file does not exist')
  }

  if (config.folders) {
    for (const folder of config.folders) {
      if (!existsSync(folder.root)) {
        throw new Error(`SPA server config \`folders\` validation failed: path ${folder.root} does not exist`)
      }
    }
  }
}
