import { createSPAServer, IRunningSPAServer, SPAServerConfig } from '../src'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Axios, { AxiosInstance, AxiosResponse } from 'axios'
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

export function getExpirationDate(resp: AxiosResponse): Date {
  // TODO: this code is pretty bad, use library for it if there is any

  const cacheControl = resp.headers['cache-control']
  const pragma = resp.headers['pragma']
  const expires = resp.headers['expires']

  if (cacheControl && /no-cache/.test(cacheControl)) {
    return new Date(0)
  }

  if (cacheControl && /no-store/.test(cacheControl)) {
    return new Date(0)
  }

  if (pragma && /no-cache/.test(pragma)) {
    return new Date(0)
  }

  if (expires) {
    return new Date(expires)
  }

  if (cacheControl && /max-age=([0-9]+)/.test(cacheControl)) {
    const expSeconds = /max-age=([0-9]+)/.exec(cacheControl)![1]
    return new Date(Date.now() + parseInt(expSeconds) * 1000)
  }

  return new Date()
}
