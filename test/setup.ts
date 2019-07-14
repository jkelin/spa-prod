import { createSPAServer, IRunningSPAServer, ISPAServerConfig } from '../src'
import { resolve } from 'path'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import Axios, { AxiosInstance } from 'axios'
import { AddressInfo } from 'net'

chai.use(chaiAsPromised)

interface ServerObject {
  port: number
  server: IRunningSPAServer
  axios: AxiosInstance
}

export function setupServer(config: Omit<ISPAServerConfig, 'port'>) {
  const serverObject: Partial<ServerObject> = {}

  beforeEach(async function() {
    serverObject.server = await createSPAServer({
      port: 0,
      silent: true,
      ...config,
    })
    serverObject.port = (serverObject.server.server.address() as AddressInfo).port
    serverObject.axios = Axios.create({
      baseURL: `http://localhost:${serverObject.port}`,
    })
  })

  afterEach(function() {
    serverObject.server!.server.close()
  })

  return serverObject as Required<Readonly<ServerObject>>
}