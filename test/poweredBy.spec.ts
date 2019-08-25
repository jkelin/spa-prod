import { expect } from 'chai'
import { join } from 'path'
import { setupServer } from './setup'
import { Preset, CacheType } from '../src'

describe('Powered by', function() {
  describe('Powered by FALSE', function() {
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
      poweredBy: false,
    })

    it('Should not crash', async function() {})

    it('Should not send poweredBy header', async function() {
      const resp = await server.axios.get(`/`)
      expect(resp.headers['x-powered-by']).to.be.undefined
    })
  })

  describe('Powered by TRUE', function() {
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
      poweredBy: true,
    })

    it('Should not crash', async function() {})

    it('Should send poweredBy header', async function() {
      const resp = await server.axios.get(`/`)
      expect(resp.headers['x-powered-by']).to.eq('SPA-PROD, Express')
    })
  })
})
