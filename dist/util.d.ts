export declare type ConfigOptionalArray<T> = undefined | null | false | true | T | T[]
export interface ISPAServerHealthcheckConfig {
  path: string
  data?: any | (() => any)
}
export interface ISPAServerConfig {
  port: number
  distFolder: string
  healthcheck?: ConfigOptionalArray<ISPAServerHealthcheckConfig>
  silent?: boolean
}
export declare function handleConfigOptionalArray<T>(item: ConfigOptionalArray<T>, defaultValue: T): T[]
export declare function handleConfigOptionalFunction<T>(item: undefined | T | (() => T), defaultValue: T): T
