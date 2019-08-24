import { expect } from 'chai'
import { join } from 'path'
import { setupServer } from './setup'
import { Preset } from '../src'
import crypto from 'crypto'
import cheerio from 'cheerio'
import { AxiosResponse } from 'axios'

export function hash(what: AxiosResponse<any>) {
  return crypto
    .createHash('sha256')
    .update(what.data!)
    .digest('base64')
}

describe('SRI tag injection', function() {
  const server = setupServer({
    root: join(__dirname, 'cra'),
    preset: Preset.CRA,
    sri: true,
  })

  it('Should not crash', async function() {})

  it('Some sri tag should be injected to index', async function() {
    const resp = await server.axios.get(`/`)

    expect(resp.data).to.include('integrity="')
  })

  it('All links should have integrity tags', async function() {
    const resp = await server.axios.get(`/`)

    const $ = cheerio.load(resp.data)

    for (const e of $('link[href][rel="stylesheet"]').toArray()) {
      const uri = $(e).attr('href')

      const computed = hash(await server.axios.get(uri))

      expect($(e).attr('integrity')).to.eq('sha256-' + computed)
    }
  })

  it('All scripts should have integrity tags', async function() {
    const resp = await server.axios.get(`/`)

    const $ = cheerio.load(resp.data)

    for (const e of $('script[src]').toArray()) {
      const uri = $(e).attr('src')

      const computed = hash(await server.axios.get(uri))

      expect($(e).attr('integrity')).to.eq('sha256-' + computed)
    }
  })
})
