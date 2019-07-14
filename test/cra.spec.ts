import { expect } from 'chai'
import { readFileSync } from 'fs'
import { join } from 'path'
import { setupServer } from './setup'

const CRAIndex = readFileSync(join(__dirname, 'cra/index.html')).toString('utf-8')
const CRAManifest = readFileSync(join(__dirname, 'cra/manifest.json')).toString('utf-8')
const CRAStatic = readFileSync(join(__dirname, 'cra/static/js/2.b41502e9.chunk.js')).toString('utf-8')

describe('CRA server', function() {
  const server = setupServer({
    index: join(__dirname, 'cra', 'index.html'),
    folders: [
      {
        root: join(__dirname, 'cra'),
        cache: 'short',
      },
      {
        path: '/static',
        root: join(__dirname, 'cra', 'static'),
        cache: 'long',
      },
    ],
  })

  it('Should start', async function() {})

  it('Should render index route', async function() {
    const resp = await server.axios.get(`/`)

    expect(resp.data).to.eq(CRAIndex)
  })

  it('Should render index route on other routes', async function() {
    const resp = await server.axios.get(`/abcd`)

    expect(resp.data).to.eq(CRAIndex)
  })

  it('Should render index route on other routes that have more segments', async function() {
    const resp = await server.axios.get('/abcd/xyz/aaa')

    expect(resp.data).to.eq(CRAIndex)
  })

  it('Should serve other files in root', async function() {
    const resp = await server.axios.get(`/manifest.json`, {
      transformResponse: res => {
        return res
      },
      responseType: 'json',
    })

    expect(resp.data).to.eq(CRAManifest)
  })

  it('Should serve static files', async function() {
    const resp = await server.axios.get(`/static/js/2.b41502e9.chunk.js`)

    expect(resp.data).to.eq(CRAStatic)
  })
})
