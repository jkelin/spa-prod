import { SPAServerConfig } from './util'
export declare function readEnvs(config: SPAServerConfig): Record<string, any>
export declare function injectEnvsIntoHtml(config: SPAServerConfig, envs: Record<string, any>, html: string): string
