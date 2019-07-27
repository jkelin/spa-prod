import { createSPAServer, IRunningSPAServer, SPAServerConfig } from '../src'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Axios, { AxiosInstance } from 'axios'
import { AddressInfo } from 'net'

chai.use(chaiAsPromised)

interface ServerObject {
  port: number
  server: IRunningSPAServer
  axios: AxiosInstance
}

export function setupServer(config: Omit<SPAServerConfig, 'port'>) {
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
