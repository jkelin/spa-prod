import { expect } from 'chai'
import { join } from 'path'
import { setupServer } from './setup'
import { Preset } from '../src'

export function atob(what: string) {
  return Buffer.from(what, 'base64').toString('utf-8')
}

describe('Prefetch tag injection', function() {
  describe('CRA', function() {
    const server = setupServer({
      root: join(__dirname, 'cra'),
      preset: Preset.CRA,
      prefetch: true,
    })

    it('Should not crash', async function() {})

    it('Some prefetch tag should be injected to index', async function() {
      const resp = await server.axios.get(`/`)

      expect(resp.data).to.include('<link rel="prefetch"')
    })

    it('All prefetchables should be prefetched', async function() {
      const resp = await server.axios.get(`/`)

      expect(resp.data).to.include('<link rel="prefetch" href="/static/js/2.b41502e9.chunk.js">')
      expect(resp.data).to.include('<link rel="prefetch" href="/static/js/main.28647029.chunk.js">')
      expect(resp.data).to.include('<link rel="prefetch" href="/static/js/runtime~main.a8a9905a.js">')
      expect(resp.data).to.include('<link rel="prefetch" href="/static/css/main.2cce8147.chunk.css">')
      expect(resp.data).to.include(
        '<link rel="prefetch" href="/precache-manifest.054774adbe886ee6e3c29227ef1745b5.js">'
      )
      expect(resp.data).to.include('<link rel="prefetch" href="/service-worker.js">')
    })
  })

  describe('CRA different paths', function() {
    const server = setupServer({
      index: join(__dirname, 'cra', 'index.html'),
      folders: [
        { root: join(__dirname, 'cra', 'static'), path: '/xyz' },
        { root: join(__dirname, 'cra', 'static'), path: '/abc/xyz' },
      ],
      prefetch: true,
    })

    it('Should not crash', async function() {})

    it('Some prefetch tag should be injected to index', async function() {
      const resp = await server.axios.get(`/`)

      expect(resp.data).to.include('<link rel="prefetch"')
    })

    it('Old prefetchabes should NOT be included', async function() {
      const resp = await server.axios.get(`/`)

      expect(resp.data).to.not.include('<link rel="prefetch" href="/static/js/2.b41502e9.chunk.js">')
      expect(resp.data).to.not.include('<link rel="prefetch" href="/static/js/main.28647029.chunk.js">')
      expect(resp.data).to.not.include('<link rel="prefetch" href="/static/js/runtime~main.a8a9905a.js">')
      expect(resp.data).to.not.include('<link rel="prefetch" href="/static/css/main.2cce8147.chunk.css">')
    })

    it('Level1 prefetchabes should be included', async function() {
      const resp = await server.axios.get(`/`)

      expect(resp.data).to.include('<link rel="prefetch" href="/xyz/js/2.b41502e9.chunk.js">')
      expect(resp.data).to.include('<link rel="prefetch" href="/xyz/js/main.28647029.chunk.js">')
      expect(resp.data).to.include('<link rel="prefetch" href="/xyz/js/runtime~main.a8a9905a.js">')
      expect(resp.data).to.include('<link rel="prefetch" href="/xyz/css/main.2cce8147.chunk.css">')
    })

    it('Level2 prefetchabes should be included', async function() {
      const resp = await server.axios.get(`/`)

      expect(resp.data).to.include('<link rel="prefetch" href="/abc/xyz/js/2.b41502e9.chunk.js">')
      expect(resp.data).to.include('<link rel="prefetch" href="/abc/xyz/js/main.28647029.chunk.js">')
      expect(resp.data).to.include('<link rel="prefetch" href="/abc/xyz/js/runtime~main.a8a9905a.js">')
      expect(resp.data).to.include('<link rel="prefetch" href="/abc/xyz/css/main.2cce8147.chunk.css">')
    })
  })
})
