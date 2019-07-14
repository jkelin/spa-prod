export declare type ConfigOptionalArray<T> = undefined | null | false | true | T | T[]
export declare type CacheType = 'none' | 'short' | 'long' | 'immutable'
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
}
export declare function handleConfigOptionalArray<T>(item: ConfigOptionalArray<T>, defaultValue: T): T[]
export declare function handleConfigOptionalFunction<T>(item: undefined | T | (() => T), defaultValue: T): T
export declare function generateSPAServerConfig(opts: { root: string; port: number }): SPAServerConfig
export declare function validateSPAServerConfig(config: SPAServerConfig): void
