#!/usr/bin/env node

import yargs from 'yargs'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { createSPAServer } from './server'

const opts = yargs
  .scriptName('spa-prod')
  .option('port', {
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
  .option('root', {
    describe: 'Root path to serve',
    type: 'string',
    demandOption: true,
    coerce: root => {
      if (!existsSync(root)) {
        throw new Error('Root path does not exist')
      } else {
        return resolve(root)
      }
    },
  })
  .option('folders', {
    describe: 'Folders to serve. Overrides `root` and `preset`',
    type: 'array',
    demand: true,
    coerce: root => {
      if (!existsSync(root)) {
        throw new Error('Root path does not exist')
      } else {
        return resolve(root)
      }
    },
  })
  .help()
  .pkgConf('spa-prod')
  .env('SPA_PROD').argv

createSPAServer(opts as any)
