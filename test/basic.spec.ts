import { expect } from 'chai'
import { setupServer } from './setup'
import { join } from 'path'
import { createSPAServer } from '../src'
import { readFileSync } from 'fs'

const indexContent = readFileSync(join(__dirname, 'basic', 'index.html')).toString('utf-8')
const aContent = readFileSync(join(__dirname, 'basic', 'a.txt')).toString('utf-8')

describe('Basic server', function() {
  const server = setupServer({
    index: join(__dirname, 'basic', 'index.html'),
    folders: [
      {
        root: join(__dirname, 'basic'),
      },
    ],
  })

  it('Should start', async function() {})

  it('Should render index route', async function() {
    const resp = await server.axios.get(`/`)

    expect(resp.data).to.eq(indexContent)
  })

  it('Should render index route on other routes', async function() {
    const resp = await server.axios.get(`/abcd`)

    expect(resp.data).to.eq(indexContent)
  })

  it('Should render index route on other routes that have more segments', async function() {
    const resp = await server.axios.get(`/abcd/xyz/aaa`)

    expect(resp.data).to.eq(indexContent)
  })

  it('Should serve other files in root', async function() {
    const resp = await server.axios.get(`/a.txt`)

    expect(resp.data).to.eq(aContent)
  })

  it('Should return 404 for a file that does not exist', async function() {
    await expect(server.axios.get(`/does-not-exist.json`)).to.eventually.be.rejectedWith(/404/)
  })

  describe('With logs', function() {
    const serverWithLogs = setupServer({
      index: join(__dirname, 'basic', 'index.html'),
      folders: [
        {
          root: join(__dirname, 'basic'),
        },
      ],
      silent: false,
    })

    it('Does not crash', async function() {
      const resp = await serverWithLogs.axios.get(`/`)

      expect(resp.data).to.eq(indexContent)
    })
  })
})
