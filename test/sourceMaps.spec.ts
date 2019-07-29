import { expect } from 'chai'
import { readFileSync } from 'fs'
import { join } from 'path'
import { setupServer } from './setup'
import { Preset } from '../src'

const STATIC_CHUNK = readFileSync(join(__dirname, 'cra/static/js/2.b41502e9.chunk.js')).toString('utf-8')
const STATIC_CHUNK_SOURCEMAP = readFileSync(join(__dirname, 'cra/static/js/2.b41502e9.chunk.js.map')).toString('utf-8')

describe('Sourcemaps', function() {
  describe('Enabled sourcemaps', function() {
    const server = setupServer({
      root: join(__dirname, 'cra'),
      preset: Preset.CRA,
      sourceMaps: true,
    })

    it('Should start', async function() {})

    it('Should serve static files', async function() {
      const resp = await server.axios.get(`/static/js/2.b41502e9.chunk.js`)

      expect(resp.data).to.eq(STATIC_CHUNK)
    })

    it('Should serve sourcemaps', async function() {
      const resp = await server.axios.get(`/static/js/2.b41502e9.chunk.js.map`, {
        transformResponse: res => {
          return res
        },
        responseType: 'json',
      })

      expect(resp.data).to.eq(STATIC_CHUNK_SOURCEMAP)
    })
  })

  describe('Disabled sourcemaps', function() {
    const server = setupServer({
      root: join(__dirname, 'cra'),
      preset: Preset.CRA,
      sourceMaps: false,
    })

    it('Should start', async function() {})

    it('Should serve static files', async function() {
      const resp = await server.axios.get(`/static/js/2.b41502e9.chunk.js`)

      expect(resp.data).to.eq(STATIC_CHUNK)
    })

    it('Should NOT serve sourcemaps', async function() {
      await expect(server.axios.get(`/static/js/2.b41502e9.chunk.js.map`)).to.eventually.be.rejectedWith(/403/)
    })
  })
})
