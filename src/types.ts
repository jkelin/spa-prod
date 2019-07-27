export type ConfigOptionalArray<T> = undefined | null | false | true | T | T[]

export enum CacheType {
  None = 'none',
  Short = 'short',
  Long = 'long',
  Immutable = 'immutable',
}

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

export enum Preset {
  Auto = 'auto',
  CRA = 'cra',
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
   * Folders to serve. Overrides `root` and `preset`
   */
  folders?: SPAServerFolder[]

  /**
   * Root folder
   */
  root?: string

  /**
   * Preset to use in conjunction with `root`
   */
  preset?: Preset

  /**
   * Index.html file path
   */
  index?: string

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
