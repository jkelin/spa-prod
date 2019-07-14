/// <reference types="node" />
import { Server } from 'http'
import { Application } from 'express'
import { SPAServerConfig } from './util'
export interface RunningSPAServer {
  readonly app: Application
  readonly server: Server
  readonly config: Readonly<SPAServerConfig>
}
export declare function createSPAServer(config: SPAServerConfig): Promise<RunningSPAServer>
