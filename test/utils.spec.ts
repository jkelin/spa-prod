import { expect } from 'chai'
import { join } from 'path'
import { createSPAServer } from '../src'
import { readCli, snakeToCamelCase, readFoldersFromEnv } from '../src/util'

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

  it('Should not start with no folder, no root and no preset', async function() {
    await expect(
      createSPAServer({
        port: 0,
        index: join(__dirname, 'basic', 'index.html'),
        silent: true,
      })
    ).to.eventually.be.rejected
  })
})

describe('readCli', function() {
  it('Should read port', async function() {
    await expect(readCli(['--port', '80', '--root', join(__dirname, 'basic')])).to.deep.include({
      port: 80,
    })
  })

  it('Should read root', async function() {
    await expect(readCli(['--port', '80', '--root', join(__dirname, 'basic')])).to.deep.include({
      root: join(__dirname, 'basic'),
    })
  })

  it('Should default preset', async function() {
    await expect(readCli(['--port', '80', '--root', join(__dirname, 'basic')])).to.deep.include({
      preset: 'auto',
    })
  })

  it('Should read folders', async function() {
    await expect(readCli(['--port', '80', '--root', join(__dirname, 'basic')])).to.deep.include({
      preset: 'auto',
    })
  })
})

describe('snakeToCamelCase', function() {
  it('abcd => abcd', function() {
    expect(snakeToCamelCase('abcd')).to.eq('abcd')
  })

  it('_abcd_ => abcd', function() {
    expect(snakeToCamelCase('_abcd_')).to.eq('abcd')
  })

  it('abcd_xyz => abcdXyz', function() {
    expect(snakeToCamelCase('abcd_xyz')).to.eq('abcdXyz')
  })

  it('AbCD => abcd', function() {
    expect(snakeToCamelCase('AbCD')).to.eq('abcd')
  })

  it('ABCD_XYZ_CDE => abcdXyzCde', function() {
    expect(snakeToCamelCase('ABCD_XYZ_CDE')).to.eq('abcdXyzCde')
  })
})

describe('readFoldersFromEnv', function() {
  it('Ignores other envs', function() {
    expect(
      readFoldersFromEnv({
        abcd: 'xyz',
        abcd5: 'xyz',
        SPA_PROD_FOLDERS: 'xyz',
        SPA_PROD_FOLDERS_0: 'xyz',
      })
    ).to.deep.eq([])
  })

  it('Parses single group', function() {
    expect(
      readFoldersFromEnv({
        SPA_PROD_FOLDERS_0_ROOT: 'xyz',
        SPA_PROD_FOLDERS_0_INDEX: '/index.html',
      })
    ).to.deep.eq([{ root: 'xyz', index: '/index.html' }])
  })

  it('Parses multiple groups', function() {
    expect(
      readFoldersFromEnv({
        SPA_PROD_FOLDERS_0_ROOT: 'xyz',
        SPA_PROD_FOLDERS_1_ROOT: 'kokos',
        SPA_PROD_FOLDERS_0_INDEX: '/index.html',
        SPA_PROD_FOLDERS_1_INDEX: 'index1',
      })
    ).to.deep.eq([{ root: 'xyz', index: '/index.html' }, { root: 'kokos', index: 'index1' }])
  })

  it('Parses different syntaxes', function() {
    expect(
      readFoldersFromEnv({
        'SPA_PROD_FOLDERS.0.ROOT': 'xyz',
        'SPA_PROD_FOLDERS(1)ROOT': 'kokos',
        'SPA_PROD_FOLDERS[0]INDEX': '/index.html',
        SPA_PROD_FOLDERS1_INDEX: 'index1',
      })
    ).to.deep.eq([{ root: 'xyz', index: '/index.html' }, { root: 'kokos', index: 'index1' }])
  })
})
