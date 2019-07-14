#!/usr/bin/env node

import yargs from 'yargs'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { createSPAServer } from './server'
import { generateSPAServerConfig } from './util'

const opts = yargs
  .scriptName('spa-prod')
  .option('port', {
    alias: 'p',
    describe: 'Listen port',
    type: 'number',
    default: 80,
    coerce: port => {
      if (port < 0) {
        throw new Error('Port too low')
      } else if (port > 65535) {
        throw new Error('Port too big')
      } else {
        return port
      }
    },
  })
  .command('$0 [--port <port>] <root>', 'Serve path', argv => {
    return argv.positional('root', {
      describe: 'Root path to serve',
      type: 'string',
      demand: true,
      coerce: root => {
        if (!existsSync(root)) {
          throw new Error('Root path does not exist')
        } else {
          return resolve(root)
        }
      },
    })
  })
  .help().argv

createSPAServer(
  generateSPAServerConfig({
    port: opts.port,
    root: opts.root as string,
  })
)
