import { expect } from 'chai'
import { join } from 'path'
import { setupServer } from './setup'
import { Preset, CacheType } from '../src'
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
      csp: {
        requireSri: true,
      },
    })

    it('Should not crash', async function() {})

    it('CSP header should contain require-sri-for', async function() {
      const resp = await server.axios.get(`/`)

      expect(resp.headers['content-security-policy']).to.contain('require-sri-for script style')
    })
  })

  describe('append', function() {
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
      csp: {
        append: {
          ['style-src']: ['http://example.com'],
        },
      },
    })

    it('Should not crash', async function() {})

    it('CSP header should contain custom style-src', async function() {
      const resp = await server.axios.get(`/`)

      expect(resp.headers['content-security-policy']).to.include('http://example.com')
    })
  })

  describe('report only', function() {
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
      csp: {
        reportOnly: true,
      },
    })

    it('Should not crash', async function() {})

    it('CSP header be content-security-policy-report-only', async function() {
      const resp = await server.axios.get(`/`)

      expect(resp.headers).not.to.have.property('content-security-policy')
      expect(resp.headers).to.have.property('content-security-policy-report-only')
    })
  })
})
