import { expect } from 'chai'
import { join } from 'path'
import { setupServer } from './setup'
import { v4 } from 'uuid'

export function atob(what: string) {
  return Buffer.from(what, 'base64').toString('utf-8')
}

describe('ENV injection', function() {
  describe('With injected envs', function() {
    process.env.ENV_TEST_UUID = v4()
    process.env.ENV_TEST_NUMBER = '5'
    process.env.ENV_TEST_NULL = 'null'
    process.env.ENV_TEST_TRUE = 'true'
    process.env.ENV_TEST_FALSE = 'false'
    process.env.ENV_TEST_EMPTY = ''

    const server = setupServer({
      index: join(__dirname, 'cra', 'index.html'),
      envs: [
        'ENV_TEST_UUID',
        'ENV_TEST_NUMBER',
        'ENV_TEST_NULL',
        'ENV_TEST_TRUE',
        'ENV_TEST_FALSE',
        'ENV_TEST_UNDEFINED',
        'ENV_TEST_EMPTY',
      ],
      folders: [
        {
          root: join(__dirname, 'basic'),
        },
      ],
    })

    it('Should not crash', async function() {})

    it('Some script should be injected to index', async function() {
      const resp = await server.axios.get(`/`)

      expect(resp.data).to.include('<script>window.__env=')
    })

    it('Envs should be parseable from injected script', async function() {
      const resp = await server.axios.get(`/`)

      const matches = /<script>window\.__env=(.+)<\/script>/.exec(resp.data)

      expect(matches!.length).to.eq(2)

      const value = eval(matches![1]!)

      expect(value).to.deep.eq({
        ENV_TEST_UUID: process.env.ENV_TEST_UUID,
        ENV_TEST_NUMBER: 5,
        ENV_TEST_NULL: null,
        ENV_TEST_TRUE: true,
        ENV_TEST_FALSE: false,
        ENV_TEST_EMPTY: '',
      })
    })
  })
})
