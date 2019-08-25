import { expect } from 'chai'
import { join } from 'path'
import { setupServer } from './setup'
import { Preset, CacheType } from '../src'

describe('Basic authentication', function() {
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
    username: 'test',
    password: '1234',
  })

  it('Should not crash', async function() {})

  it('Should request basic auth for index', async function() {
    await expect(server.axios.get(`/`)).to.eventually.be.rejectedWith(/401/)
  })

  it('Should accept username and password', async function() {
    await server.axios.get(`/`, {
      auth: {
        username: 'test',
        password: '1234',
      },
    })
  })

  it('Should fail with wrong username and password', async function() {
    await expect(
      server.axios.get(`/`, {
        auth: {
          username: 'test',
          password: '6789',
        },
      })
    ).to.eventually.be.rejectedWith(/401/)
  })

  it('Should request basic auth for folders', async function() {
    await expect(server.axios.get(`/static/js/2.b41502e9.chunk.js`)).to.eventually.be.rejectedWith(/401/)
  })

  it('Should not request basic auth for healthchecks', async function() {
    await server.axios.get(`/healthz`)
  })
})
