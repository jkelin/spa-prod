export type ConfigOptionalArray<T> = undefined | null | false | true | T | T[]

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
