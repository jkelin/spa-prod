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
  readonly path: string

  /**
   * Object containing data to serve on this endpoint or a function to generate said data
   */
  readonly data?: any | (() => any)
}

export enum Preset {
  None = 'none',
  CRA = 'cra',
}

export interface SPAServerFolder {
  /**
   * Path of the folder
   */
  readonly root: string

  /**
   * HTTP path from which to server this folder
   * @default /
   */
  readonly path?: string

  /**
   * Caching longevity
   * @default "short"
   */
  readonly cache?: CacheType
}

export interface SPAServerConfig {
  /**
   * Listen port
   */
  readonly port: number

  /**
   * Folders to serve. Overrides `root` and `preset`
   */
  readonly folders?: SPAServerFolder[]

  /**
   * Root folder
   */
  readonly root?: string

  /**
   * Preset to use in conjunction with `root`
   */
  readonly preset?: Preset

  /**
   * Index.html file path
   */
  readonly index?: string

  /**
   * Healthcheck endpoint configuration
   */
  readonly healthcheck?: ConfigOptionalArray<SPAServerHealthcheckConfig>

  /**
   * Should logs be printed?
   */
  readonly silent?: boolean

  /**
   * Whitelisted environment variables to be injected into index and served from healthcheck
   */
  readonly envs?: string[]

  /**
   * Property to inject envs into
   * @default "window.__env"
   */
  readonly envsPropertyName?: string

  /**
   * Send 403 for source maps when false. This should be set to `false` in real PROD environment (but it is very useful in DEV envs)
   * @default true
   */
  readonly sourceMaps?: boolean

  /**
   * Inject prefetch links into index HTML for js and css assets
   * @default true
   */
  readonly prefetch?: boolean
}
