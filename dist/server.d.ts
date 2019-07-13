/// <reference types="node" />
import { Server } from 'http'
import { Application } from 'express'
import { ISPAServerConfig } from './util'
export interface IRunningSPAServer {
  readonly app: Application
  readonly server: Server
  readonly config: Readonly<ISPAServerConfig>
}
export declare function createSPAServer(config: ISPAServerConfig): Promise<IRunningSPAServer>
