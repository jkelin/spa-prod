import { existsSync } from 'fs'
import {
  ConfigOptionalArray,
  SPAServerConfig,
  Preset,
  SPAServerFolder,
  CacheType,
  SPAServerHealthcheckConfig,
} from './types'
import yargs from 'yargs'
import { resolve } from 'path'
import { v4 } from 'uuid'
import joi, { SchemaLike } from '@hapi/joi'

const Joi: typeof joi = joi.extend({
  base: joi.string(),
  name: 'string',
  language: {
    path: 'This path does not exist',
  },
  rules: [
    {
      name: 'path',
      description: 'Is path that exists',
      validate(params, value, state, options) {
        if (value && !existsSync(value)) {
          return this.createError('string.path', { v: value }, state, options)
        }

        return value
      },
    },
  ],
}) as any

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
  const healthCheckSchema: Record<keyof SPAServerHealthcheckConfig, SchemaLike | SchemaLike[]> = {
    data: [Joi.boolean(), Joi.object(), Joi.string(), Joi.func(), Joi.allow(null)],
    path: Joi.string()
      .uri({ relativeOnly: true, allowRelative: true })
      .required(),
  }

  const foldersSchema: Record<keyof SPAServerFolder, SchemaLike | SchemaLike[]> = {
    cache: Joi.valid(Object.values(CacheType).map(x => x.toLowerCase())),
    path: Joi.string().uri({ relativeOnly: true, allowRelative: true }),
    root: (Joi.string() as any).path().required(),
  }

  const schema: Record<keyof SPAServerConfig, SchemaLike | SchemaLike[]> = {
    envs: Joi.array(),
    envsPropertyName: Joi.string(),
    folders: Joi.array().items(foldersSchema),
    index: (Joi.string() as any).path(),
    port: Joi.number()
      .port()
      .required(),
    preset: Joi.valid(Object.values(Preset).map(x => x.toLowerCase())),
    root: (Joi.string() as any).path(),
    silent: Joi.boolean(),
    healthcheck: [
      Joi.boolean(),
      Joi.string(),
      Joi.array().items(healthCheckSchema),
      Joi.object(healthCheckSchema),
      Joi.allow(null),
    ],
  }

  const masterSchema = Joi.object(schema)
    .label('Config')
    .xor('root', 'folders')
    .and('root', 'preset')
    .with('folders', 'index')

  Joi.assert(config, masterSchema, 'Configuration invalid')
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
      default: 'none',
      choices: Object.values(Preset).map(x => x.toLowerCase()),
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

  return {
    envs: config.envs,
    envsPropertyName: config.envsPropertyName,
    folders: config.folders as any,
    healthcheck: config.healthcheck,
    index: config.index,
    port: config.port,
    preset: config.preset as Preset,
    root: config.root,
    silent: config.silent,
  }
}
