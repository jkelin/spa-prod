import { existsSync } from 'fs'
import { ConfigOptionalArray, SPAServerConfig, Preset, SPAServerFolder } from './types'
import yargs from 'yargs'
import { resolve } from 'path'
import { v4 } from 'uuid'

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

  if (!config.folders && !(config.root && config.preset)) {
    throw new Error('Config invalid because `root` & `config` or `folders` are not set')
  }
}

export function parseEnv(value?: string): string | number | boolean | null | undefined {
  if (value === undefined) {
    return undefined
  }

  if (value === '') {
    return ''
  }

  if (value === 'null') {
    return null
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  if (!isNaN(parseFloat(value)) && isFinite(value as any)) {
    return parseFloat(value)
  }

  return value
}

export function snakeToCamelCase(what: string) {
  const res = what
    .split('_')
    .filter(Boolean)
    .map(x => x[0].toUpperCase() + x.substring(1).toLowerCase())
    .join('')

  return res[0].toLowerCase() + res.substring(1)
}

export function readFoldersFromEnv(envs: Record<string, string | undefined>): SPAServerFolder[] {
  const folders: Record<number, Record<string, any>> = {}
  const indexKey = v4()

  const nameRegex = /^SPA_PROD_FOLDERS(?:\((\d+)\)|(\d+)|_(\d+)|\.(\d+)\.|\[(\d+)\])_?([A-Z]+(?:_[A-Z]+)*)$/

  for (const key of Object.keys(envs)) {
    const match = nameRegex.exec(key)

    if (!match) {
      continue
    }

    const index: number = parseInt(match[1] || match[2] || match[3] || match[4] || match[5])

    if (!folders[index]) {
      folders[index] = {
        [indexKey]: index,
      }
    }

    const name = snakeToCamelCase(match[6])
    const value = parseEnv(envs[key])

    folders[index][name] = value
  }

  return Object.values(folders)
    .sort((a, b) => a[indexKey] - b[indexKey])
    .map(x => {
      delete x[indexKey]
      return x
    }) as any
}

export function readCli(argv: string[]): SPAServerConfig {
  let config = yargs
    .scriptName('spa-prod')
    .config('config', require)
    .option('port', {
      describe: 'Listen port',
      type: 'number',
      default: 80,
      alias: 'p',
      coerce: parseInt,
    })
    .option('root', {
      describe: 'Root path to serve',
      type: 'string',
      conflicts: 'paths',
      coerce: resolve,
    })
    .option('index', {
      describe: 'Index file path',
      type: 'string',
      coerce: resolve,
    })
    .option('preset', {
      describe: 'Preset to use',
      type: 'string',
      default: 'auto',
      choices: Object.keys(Preset).map(x => x.toLowerCase()),
    })
    .option('folders', {
      describe: 'Folders to serve. If you use this, do not use `root` and `preset`',
      type: 'array',
      conflicts: 'root',
      coerce: folders => {
        if (!folders || !Array.isArray(folders) || folders.length === 0) {
          return readFoldersFromEnv(process.env)
        }

        return folders
      },
    })
    .option('healthcheck', {
      describe: 'Enable healthcheck endpoint',
      type: 'boolean',
      default: true,
    })
    .option('silent', {
      describe: 'Disable logs',
      type: 'boolean',
      default: false,
    })
    .option('envs', {
      describe: 'Whitelisted environment variables to inject into index',
      type: 'array',
      default: [],
    })
    .option('envsPropertyName', {
      describe: 'Property to inject envs into',
      type: 'string',
      default: 'window.__env',
    })
    .help()
    .pkgConf('spa-prod')
    .env('SPA_PROD')
    .parse(argv)

  return config as any
}
