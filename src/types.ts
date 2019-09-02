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

export interface SPACSPConfig {
  /**
   * Additional CSP rules
   * @example
   * {
   *   'script-src': ['https://example.com'],
   *   'style-src': ['data:'],
   * }
   */
  readonly append?: Record<string, string[]>

  /**
   * CSP report uri
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri
   */
  readonly reportUri?: string

  /**
   * Run CSP in report only mode. Requires `reportUri`
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only
   * @default false
   */
  readonly reportOnly?: boolean

  /**
   * Enable `require-sri-for` directive
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/require-sri-for
   * @default false
   */
  readonly requireSri?: boolean
}

export interface SPAServerConfig {
  /**
   * Listen port
   * Do not forget to update HEALTHCHECK in your Dockerfile if you change this from 8080
   * @default 8080
   */
  readonly port: number

  /**
   * Folders to serve
   */
  readonly folders: SPAServerFolder[]

  /**
   * Index.html file path
   */
  readonly index: string

  /**
   * Working directory for relative paths.
   * This is set automatically by CLI to be folder of the config file
   */
  readonly cwd?: string

  /**
   * Healthcheck endpoint configuration
   */
  readonly healthcheck?: ConfigOptionalArray<SPAServerHealthcheckConfig>

  /**
   * Should logs be printed?
   */
  readonly silent?: boolean

  /**
   * Whitelisted environment variables to be injected into index
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
   * Enable Subresource Integrity tag injection into index for styles and scripts
   * @see https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
   * @default true
   */
  readonly sri?: boolean

  /**
   * Enable Content Security Policy
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
   * @default false
   */
  readonly csp?: SPACSPConfig | boolean

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
