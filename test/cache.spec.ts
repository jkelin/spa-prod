import { expect } from 'chai'
import { readFileSync } from 'fs'
import { join } from 'path'
import { setupServer, getExpirationDate } from './setup'
import { SPAServerFolder, CacheType } from '../src'

const fileA: SPAServerFolder = {
  path: '/a.txt',
  root: join(__dirname, 'basic', 'a.txt'),
  cache: CacheType.None,
}

const fileB: SPAServerFolder = {
  path: '/b.txt',
  root: join(__dirname, 'basic', 'b.txt'),
  cache: CacheType.Short,
}

const fileC: SPAServerFolder = {
  path: '/c.txt',
  root: join(__dirname, 'basic', 'c.txt'),
  cache: CacheType.Long,
}

const fileD: SPAServerFolder = {
  path: '/d.txt',
  root: join(__dirname, 'basic', 'd.txt'),
  cache: CacheType.Immutable,
}

describe('Cache tests', function() {
  const server = setupServer({
    index: join(__dirname, 'basic', 'index.html'),
    folders: [fileA, fileB, fileC, fileD],
  })

  it('Should start', async function() {})

  it('Index should be cached for at least 30 seconds', async function() {
    const resp = await server.axios.get(`/`)

    expect(getExpirationDate(resp)).to.gte(new Date(Date.now() + 30 * 1000))
    expect(getExpirationDate(resp)).to.lte(new Date(Date.now() + 3 * 30 * 1000))
  })

  it('a.txt should not be cached', async function() {
    const resp = await server.axios.get(fileA.path!)

    expect(resp.data).to.eq(readFileSync(fileA.root).toString('utf-8'))
    expect(getExpirationDate(resp)).to.lte(new Date())
  })

  it('b.txt should be cached for 1 minute', async function() {
    const resp = await server.axios.get(fileB.path!)

    expect(resp.data).to.eq(readFileSync(fileB.root).toString('utf-8'))
    expect(getExpirationDate(resp)).to.gte(new Date(Date.now() + 59 * 1000))
    expect(getExpirationDate(resp)).to.lte(new Date(Date.now() + 61 * 1000))
  })

  it('c.txt should be cached for 7 days', async function() {
    const resp = await server.axios.get(fileC.path!)

    expect(resp.data).to.eq(readFileSync(fileC.root).toString('utf-8'))
    expect(getExpirationDate(resp)).to.gte(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000))
    expect(getExpirationDate(resp)).to.lte(new Date(Date.now() + 8 * 24 * 60 * 60 * 1000))
  })

  it('d.txt should be cached for a year', async function() {
    const resp = await server.axios.get(fileD.path!)

    expect(resp.data).to.eq(readFileSync(fileD.root).toString('utf-8'))
    expect(getExpirationDate(resp)).to.gte(new Date(Date.now() + 360 * 24 * 60 * 60 * 1000))
    expect(getExpirationDate(resp)).to.lte(new Date(Date.now() + 370 * 24 * 60 * 60 * 1000))
  })
})
