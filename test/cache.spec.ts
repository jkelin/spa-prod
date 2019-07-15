import { expect } from 'chai'
import { readFileSync } from 'fs'
import { join } from 'path'
import { setupServer } from './setup'
import { AxiosResponse } from 'axios'
import { ISPAServerFolder } from '../src'

function getExpirationDate(resp: AxiosResponse): Date {
  // TODO: this code is pretty bad, use library for it if there is any

  const cacheControl = resp.headers['cache-control']
  const pragma = resp.headers['pragma']
  const expires = resp.headers['expires']

  if (cacheControl && /no-cache/.test(cacheControl)) {
    return new Date(0)
  }

  if (cacheControl && /no-store/.test(cacheControl)) {
    return new Date(0)
  }

  if (pragma && /no-cache/.test(pragma)) {
    return new Date(0)
  }

  if (expires) {
    return new Date(expires)
  }

  if (cacheControl && /max-age=([0-9]+)/.test(cacheControl)) {
    const expSeconds = /max-age=([0-9]+)/.exec(cacheControl)![1]
    return new Date(Date.now() + parseInt(expSeconds) * 1000)
  }

  return new Date()
}

const fileA: ISPAServerFolder = {
  path: '/a.txt',
  root: join(__dirname, 'basic', 'a.txt'),
  cache: 'none',
}

const fileB: ISPAServerFolder = {
  path: '/b.txt',
  root: join(__dirname, 'basic', 'b.txt'),
  cache: 'short',
}

const fileC: ISPAServerFolder = {
  path: '/c.txt',
  root: join(__dirname, 'basic', 'c.txt'),
  cache: 'long',
}

const fileD: ISPAServerFolder = {
  path: '/d.txt',
  root: join(__dirname, 'basic', 'd.txt'),
  cache: 'immutable',
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
  })

  it('a.txt should not be cached', async function() {
    const resp = await server.axios.get(fileA.path!)

    expect(resp.data).to.eq(readFileSync(fileA.root).toString('utf-8'))
    expect(getExpirationDate(resp)).to.lte(new Date())
  })

  it('b.txt should be cached for at least 30 seconds', async function() {
    const resp = await server.axios.get(fileB.path!)

    expect(resp.data).to.eq(readFileSync(fileB.root).toString('utf-8'))
    expect(getExpirationDate(resp)).to.gte(new Date(Date.now() + 30 * 1000))
  })

  it('c.txt should be cached for at least 1 day', async function() {
    const resp = await server.axios.get(fileC.path!)

    expect(resp.data).to.eq(readFileSync(fileC.root).toString('utf-8'))
    expect(getExpirationDate(resp)).to.gte(new Date(Date.now() + 24 * 60 * 60 * 1000))
  })

  it('d.txt should be cached for at least 1 month', async function() {
    const resp = await server.axios.get(fileD.path!)

    expect(resp.data).to.eq(readFileSync(fileD.root).toString('utf-8'))
    expect(getExpirationDate(resp)).to.gte(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  })
})
