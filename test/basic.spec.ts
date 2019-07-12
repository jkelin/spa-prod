import { expect } from 'chai'
import { setupServer } from './setup'

describe('Basic server', function() {
  const server = setupServer()

  it('Should start', async function() {})

  it('Should render index route', async function() {
    const resp = await server.axios.get(`/`)

    expect(resp.data).to.eq('basic index html')
  })

  it('Should render index route on other routes', async function() {
    const resp = await server.axios.get(`/abcd`)

    expect(resp.data).to.eq('basic index html')
  })

  it('Should render index route on other routes that have more segments', async function() {
    const resp = await server.axios.get(`/abcd/xyz/aaa`)

    expect(resp.data).to.eq('basic index html')
  })

  it('Should serve other files in root', async function() {
    const resp = await server.axios.get(`/test.json`)

    expect(resp.data).to.be.a('object')
    expect(resp.data)
      .to.have.property('hello')
      .which.eq('world')
  })

  it('Should return 404 for a file that does not exist', async function() {
    await expect(server.axios.get(`/does-not-exist.json`)).to.eventually.be.rejectedWith(/404/)
  })
})
