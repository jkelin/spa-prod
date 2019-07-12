import { createSPAServer, IRunningSPAServer } from '../src'
import { resolve } from 'path'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import Axios, { AxiosInstance } from 'axios'
import { AddressInfo } from 'net'

chai.use(chaiAsPromised)

function dynamicPort() {
  const from = 49152
  const to = 50000
  return from + Math.floor(Math.random() * (to - from))
}

interface ServerObject {
  port: number
  server: IRunningSPAServer
  axios: AxiosInstance
}

export function setupServer() {
  const serverObject: Partial<ServerObject> = {}

  beforeEach(async function() {
    serverObject.server = await createSPAServer({
      port: 0,
      distFolder: resolve(__dirname, 'basic'),
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
