import { existsSync, createReadStream, readFile, stat } from 'fs'
import {
  ConfigOptionalArray,
  SPAServerConfig,
  Preset,
  SPAServerFolder,
  CacheType,
  SPAServerHealthcheckConfig,
  MappedFileInfo,
  SPACSPConfig,
} from './types'
import yargs from 'yargs'
import { resolve, join } from 'path'
import { v4 } from 'uuid'
import joi, { SchemaLike } from '@hapi/joi'
import { Hash, createHash } from 'crypto'
import { memoize, uniq, flatMap } from 'lodash'
import { promisify } from 'util'
import glob from 'glob-promise'

const readFileAsync = promisify(readFile)
const statAsync = promisify(stat)

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
    path: Joi.string()
      .default('/')
      .uri({ relativeOnly: true, allowRelative: true }),
    root: (Joi.string() as any).path().required(),
  }

  const cspSchema: Record<keyof SPACSPConfig, SchemaLike | SchemaLike[]> = {
    reportOnly: Joi.boolean().default(false),
    requireSri: Joi.boolean().default(false),
    reportUri: Joi.string(),
    append: Joi.object(),
  }

  const schema: Record<keyof SPAServerConfig, SchemaLike | SchemaLike[]> = {
    envs: Joi.array(),
    envsPropertyName: Joi.string().default('window.__env'),
    folders: Joi.array().items(foldersSchema),
    index: (Joi.string() as any).path(),
    port: Joi.number()
      .port()
      .required(),
    preset: Joi.valid(Object.values(Preset).map(x => x.toLowerCase())),
    root: (Joi.string() as any).path(),
    silent: Joi.boolean(),
    sourceMaps: Joi.boolean().default(true),
    prefetch: Joi.boolean().default(true),
    username: Joi.string(),
    password: Joi.string(),
    poweredBy: Joi.boolean().default(true),
    sri: Joi.boolean().default(true),
    csp: [Joi.object(cspSchema), Joi.boolean()],
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
    .and('username', 'password')
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
    .option('prefetch', {
      describe: 'Inject prefetch links into index HTML for js and css assets',
      type: 'boolean',
      default: true,
    })
    .option('sourceMaps', {
      describe:
        'Send 403 for source maps when false. This should be set to `false` in real PROD environment (but it is very useful in DEV envs)',
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
    .option('username', {
      describe: 'Basic authentication username',
      type: 'string',
    })
    .option('password', {
      describe: 'Basic authentication password',
      type: 'string',
    })
    .option('poweredBy', {
      describe: 'Send X-Powered-By header (SPA-PROD, Express)',
      type: 'boolean',
      default: true,
    })
    .option('sri', {
      describe: 'Enable Subresource Integrity tag injection into index for styles and scripts',
      type: 'boolean',
      default: true,
    })
    .option('csp', {
      describe: 'Enable Content Security Policy',
      default: false,
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
    sourceMaps: config.sourceMaps,
    prefetch: config.prefetch,
    username: config.username,
    password: config.password,
    poweredBy: config.poweredBy,
    sri: config.sri,
    csp: config.csp,
  }
}

export function injectMetaTagsIntoHtml(html: string, ...tags: string[]) {
  return html.replace('</head>', `${tags.join('\n')}\n</head>`)
}

function generateIntegrity(prefix: string, sha256: Hash) {
  return `${prefix}-${sha256.digest('base64')}`
}

export const generateIntegrityForBuffer = memoize(function(content: Buffer | string) {
  const sha256 = createHash('sha256').update(content)
  return generateIntegrity('sha256', sha256)
})

export const generateIntegrityForFile = memoize(async function(file: string) {
  return new Promise<string>((resolve, reject) => {
    let shasum = createHash('sha256')

    let s = createReadStream(file)

    s.on('data', function(data: Buffer) {
      shasum.update(data)
    })

    s.on('end', function() {
      return resolve(generateIntegrity('sha256', shasum))
    })

    s.on('error', err => reject(err))
  })
})

export async function findFilesInFolderByPattern(root: string, pattern: string): Promise<MappedFileInfo[]> {
  const stat = await statAsync(root)

  if (!stat.isDirectory()) {
    return []
  }

  return (await glob(pattern, { cwd: root, nodir: true }))
    .map(x => ({ file: join(root, x), path: join('/', x) }))
    .map(({ file, path }) => ({ file, path: path.replace(/\\/g, '/') }))
}

export async function findFilesInFoldersByPattern(
  folders: SPAServerFolder[],
  pattern: string
): Promise<MappedFileInfo[]> {
  const filesByFolder = await Promise.all(folders.map(f => findFilesInFolderByPattern(f.root, pattern)))
  const filesWithPaths = folders.map((folder, i) =>
    filesByFolder[i].map(({ file, path }) => ({ file, path: join(folder.path || '/', path) }))
  )

  return uniq(flatMap(filesWithPaths)).map(({ file, path }) => ({ file, path: path.replace(/\\/g, '/') }))
}

export async function findFilesForConfigByPattern(config: SPAServerConfig, pattern: string) {
  return config.folders
    ? await findFilesInFoldersByPattern(config.folders, pattern)
    : await findFilesInFolderByPattern(config.root!, pattern)
}
