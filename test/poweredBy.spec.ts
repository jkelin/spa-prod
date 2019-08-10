import { expect } from 'chai'
import { join } from 'path'
import { setupServer } from './setup'
import { Preset } from '../src'

describe('Powered by', function() {
  describe('Powered by FALSE', function() {
    const server = setupServer({
      root: join(__dirname, 'cra'),
      preset: Preset.CRA,
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
      root: join(__dirname, 'cra'),
      preset: Preset.CRA,
      poweredBy: true,
    })

    it('Should not crash', async function() {})

    it('Should send poweredBy header', async function() {
      const resp = await server.axios.get(`/`)
      expect(resp.headers['x-powered-by']).to.eq('SPA-PROD, Express')
    })
  })
})
