import { expect } from 'chai'
import { setupServer } from './setup'

describe('Healthcheck', function() {
  describe('Default config', function() {
    const server = setupServer()

    it('Healthcheck should have status ok', async function() {
      const resp = await server.axios.get(`/healthz`)

      expect(resp.data).to.have.property('status', 'ok')
    })

    it('Healthcheck should return property now', async function() {
      const resp = await server.axios.get(`/healthz`)

      expect(resp.data).to.have.property('now')
    })
  })

  describe('Object config', function() {
    const server = setupServer({
      healthcheck: { path: '/HC', data: { test: true } },
    })

    it('Automatic healthcheck does not work', async function() {
      const resp = await server.axios.get(`/healthz`)

      expect(resp.data).to.eq('basic index html')
    })

    it('Healthcheck on new address should work', async function() {
      const resp = await server.axios.get(`/HC`)
    })

    it('Healthcheck on new address should return test: true', async function() {
      const resp = await server.axios.get(`/HC`)

      expect(resp.data).to.have.property('test', true)
    })

    it('Healthcheck on new address should not return status: ok', async function() {
      const resp = await server.axios.get(`/HC`)

      expect(resp.data).not.to.have.property('status', 'ok')
    })
  })

  describe('Array config', function() {
    const server = setupServer({
      healthcheck: [{ path: '/HC', data: { test: true } }, { path: '/HC2', data: { test: 2 } }],
    })

    it('Automatic healthcheck does not work', async function() {
      const resp = await server.axios.get(`/healthz`)

      expect(resp.data).to.eq('basic index html')
    })

    it('Healthcheck on /HC should work', async function() {
      const resp = await server.axios.get(`/HC`)
    })

    it('Healthcheck on /HC should return test: true', async function() {
      const resp = await server.axios.get(`/HC`)

      expect(resp.data).to.have.property('test', true)
    })

    it('Healthcheck on /HC should not return status: ok', async function() {
      const resp = await server.axios.get(`/HC`)

      expect(resp.data).not.to.have.property('status', 'ok')
    })

    it('Healthcheck on /HC2 should work', async function() {
      const resp = await server.axios.get(`/HC2`)
    })

    it('Healthcheck on /HC2 should return test: 2', async function() {
      const resp = await server.axios.get(`/HC2`)

      expect(resp.data).to.have.property('test', 2)
    })

    it('Healthcheck on /HC2 should not return status: ok', async function() {
      const resp = await server.axios.get(`/HC2`)

      expect(resp.data).not.to.have.property('status', 'ok')
    })
  })

  describe('Function config', function() {
    const server = setupServer({
      healthcheck: { path: '/HC', data: () => ({ test: true }) },
    })

    it('Automatic healthcheck does not work', async function() {
      const resp = await server.axios.get(`/healthz`)

      expect(resp.data).to.eq('basic index html')
    })

    it('Healthcheck on new address should work', async function() {
      const resp = await server.axios.get(`/HC`)
    })

    it('Healthcheck on new address should return test: true', async function() {
      const resp = await server.axios.get(`/HC`)

      expect(resp.data).to.have.property('test', true)
    })

    it('Healthcheck on new address should not return status: ok', async function() {
      const resp = await server.axios.get(`/HC`)

      expect(resp.data).not.to.have.property('status', 'ok')
    })
  })

  describe('True config', function() {
    const server = setupServer({
      healthcheck: { path: '/HC', data: true },
    })

    it('Automatic healthcheck does not work', async function() {
      const resp = await server.axios.get(`/healthz`)

      expect(resp.data).to.eq('basic index html')
    })

    it('Healthcheck on new address should work', async function() {
      const resp = await server.axios.get(`/HC`)
    })
  })

  describe('Undefined data', function() {
    const server = setupServer({
      healthcheck: { path: '/HC' },
    })

    it('Automatic healthcheck does not work', async function() {
      const resp = await server.axios.get(`/healthz`)

      expect(resp.data).to.eq('basic index html')
    })

    it('Healthcheck on new address should work', async function() {
      const resp = await server.axios.get(`/HC`)
    })
  })

  describe('False config', function() {
    const server = setupServer({
      healthcheck: false,
    })

    it('Automatic healthcheck does not work', async function() {
      const resp = await server.axios.get(`/healthz`)

      expect(resp.data).to.eq('basic index html')
    })
  })

  describe('Null config', function() {
    const server = setupServer({
      healthcheck: null,
    })

    it('Automatic healthcheck does not work', async function() {
      const resp = await server.axios.get(`/healthz`)

      expect(resp.data).to.eq('basic index html')
    })
  })
})
