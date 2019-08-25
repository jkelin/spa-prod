import { expect } from 'chai'
import { readFileSync } from 'fs'
import { join } from 'path'
import { setupServer, getExpirationDate } from './setup'
import { Preset, CacheType } from '../src'
import cheerio from 'cheerio'

const INDEX = cheerio.load(readFileSync(join(__dirname, 'cra/index.html')).toString('utf-8')).html()
const MANIFEST = readFileSync(join(__dirname, 'cra/manifest.json')).toString('utf-8')
const STATIC_CHUNK = readFileSync(join(__dirname, 'cra/static/js/2.b41502e9.chunk.js')).toString('utf-8')

describe('CRA preset server', function() {
  const server = setupServer({
    folders: [
      {
        path: '/static',
        cache: CacheType.Immutable,
        root: join(__dirname, 'cra/static'),
      },
      {
        path: '/',
        cache: CacheType.Short,
        root: join(__dirname, 'cra'),
      },
    ],
    index: join(__dirname, 'cra/index.html'),
  })

  it('Should start', async function() {})

  it('Should render index route', async function() {
    const resp = await server.axios.get(`/`)

    expect(resp.data).to.eq(INDEX)
  })

  it('Should render index route on other routes', async function() {
    const resp = await server.axios.get(`/abcd`)

    expect(resp.data).to.eq(INDEX)
  })

  it('Should render index route on other routes that have more segments', async function() {
    const resp = await server.axios.get('/abcd/xyz/aaa')

    expect(resp.data).to.eq(INDEX)
  })

  it('Should serve other files in root', async function() {
    const resp = await server.axios.get(`/manifest.json`, {
      transformResponse: res => {
        return res
      },
      responseType: 'json',
    })

    expect(resp.data).to.eq(MANIFEST)
  })

  it('Files in root should have correct expiration', async function() {
    const resp = await server.axios.get(`/manifest.json`)

    expect(getExpirationDate(resp)).to.lte(new Date(Date.now() + 120 * 1000))
  })

  it('Should serve static files', async function() {
    const resp = await server.axios.get(`/static/js/2.b41502e9.chunk.js`)

    expect(resp.data).to.eq(STATIC_CHUNK)
  })

  it('Static files should have correct expiration', async function() {
    const resp = await server.axios.get(`/static/js/2.b41502e9.chunk.js`)

    expect(getExpirationDate(resp)).to.gte(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  })
})
