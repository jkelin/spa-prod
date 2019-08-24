import { expect } from 'chai'
import { join } from 'path'
import { setupServer } from './setup'
import { Preset } from '../src'
import crypto from 'crypto'
import cheerio from 'cheerio'
import { AxiosResponse } from 'axios'

export function hash(what: string) {
  return crypto
    .createHash('sha256')
    .update(what)
    .digest('base64')
}

describe('CSP', function() {
  describe('Default', function() {
    const server = setupServer({
      root: join(__dirname, 'cra'),
      preset: Preset.CRA,
      csp: true,
    })

    it('Should not crash', async function() {})

    it('Some CSP header should be send for index', async function() {
      const resp = await server.axios.get(`/`)

      expect(resp.headers).to.have.property('content-security-policy')
    })

    it('CSP header should contain nonce', async function() {
      const resp = await server.axios.get(`/`)

      expect(resp.headers['content-security-policy']).to.include('nonce-')
    })

    it('Nonce should be injected for scripts with src', async function() {
      const resp = await server.axios.get(`/`)

      const nonce = /'nonce-([^' ]+)'/.exec(resp.headers['content-security-policy'])![1]

      const $ = cheerio.load(resp.data)

      const scriptsWithSrc = $('script[src]').toArray()

      for (const script of scriptsWithSrc) {
        expect($(script).attr('nonce')).to.eq(nonce)
      }
    })

    it('Hash should be in csp for inline scripts', async function() {
      const resp = await server.axios.get(`/`)

      const $ = cheerio.load(resp.data)

      for (const script of $('script:not([src])').toArray()) {
        const content = $(script).html()!
        const contentHash = hash(content)

        expect(resp.headers['content-security-policy']).to.include(contentHash)
      }
    })
  })

  describe('require-sri-for', function() {
    const server = setupServer({
      root: join(__dirname, 'cra'),
      preset: Preset.CRA,
      csp: {
        requireSri: true,
      },
    })

    it('Should not crash', async function() {})

    it('CSP header should contain require-sri-for', async function() {
      const resp = await server.axios.get(`/`)

      expect(resp.headers['content-security-policy']).to.include('require-sri-for script style')
    })
  })
})
