import { expect } from 'chai'
import { join } from 'path'
import { generateSPAServerConfig } from '../src/util'
import { createSPAServer } from '../src'

describe('generateSPAServerConfig', function() {
  it('Should generate proper config', function() {
    const opts = {
      port: 12345,
      root: join(__dirname, 'basic'),
    }

    const config = generateSPAServerConfig(opts)

    expect(config.port).to.eq(opts.port)
    expect(config.index).to.eq(join(__dirname, 'basic', 'index.html'))
    expect(config.folders).to.have.lengthOf(1)
    expect(config.folders![0]).to.eql({
      root: opts.root,
      path: '/',
    })
  })
})

describe('validateSPAServerConfig', function() {
  it('Should not start with nonexistant index', async function() {
    await expect(
      createSPAServer({
        port: 0,
        silent: true,
        index: join(__dirname, 'index.html'),
      })
    ).to.eventually.be.rejected
  })

  it('Should not start with nonexistant folder', async function() {
    await expect(
      createSPAServer({
        port: 0,
        index: join(__dirname, 'basic', 'index.html'),
        silent: true,
        folders: [
          {
            root: join(__dirname, 'basic', 'xyz'),
          },
        ],
      })
    ).to.eventually.be.rejected
  })
})
