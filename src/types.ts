export type ConfigOptionalArray<T> = undefined | null | false | true | T | T[]

export enum CacheType {
  /**
   * Disable caching (useful for APIs)
   */
  None = 'none',
  /**
   * Short time caching (useful for normal files likes index.html). Currently one minute
   */
  Short = 'short',
  /**
   * Long term caching. Currently 7 days
   */
  Long = 'long',
  /**
   * For files that never changed, usually with versions or hashes in their names. Currently one year. Adds `Cache-Control: immutable`
   */
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
  /**
   * Serve root without presets with only short time caching.
   * **Do not use this**, it removes greatest benefit of SPA-PROD
   */
  None = 'none',
  /**
   * Preset for Create React APP
   * @see https://facebook.github.io/create-react-app/
   */
  CRA = 'cra',
}

export interface SPAServerFolder {
  /**
   * Directory where to recursively look for files
   */
  readonly root: string

  /**
   * HTTP path from which to server this folder
   * @default /
   */
  readonly path?: string

  /**
   * Caching policy for files in this folder.
   * You will usually want to use either `short` or `immutable`.
   * Each policy has it's own headers
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

  /**
   * Basic authentication username
   */
  readonly username?: string

  /**
   * Basic authentication password
   */
  readonly password?: string

  /**
   * Send `X-Powered-By` header (SPA-PROD, Express)
   * @default true
   */
  readonly poweredBy?: boolean
}
