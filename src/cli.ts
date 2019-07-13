#!/bin/sh

import * as yargs from 'yargs'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { createSPAServer } from './server'

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
  .command('$0 [--port <port>] <path>', 'Serve path', argv => {
    return argv.positional('path', {
      describe: 'Root path to serve',
      type: 'string',
      demand: true,
      coerce: path => {
        if (!existsSync(path)) {
          throw new Error('Path does not exist')
        } else {
          return resolve(path)
        }
      },
    })
  })
  .help().argv

createSPAServer({
  port: opts.port,
  distFolder: opts.path as string,
})
