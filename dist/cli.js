#!/bin/sh
'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var yargs = require('yargs')
var fs_1 = require('fs')
var path_1 = require('path')
var server_1 = require('./server')
var opts = yargs
  .scriptName('spa-prod')
  .option('port', {
    alias: 'p',
    describe: 'Listen port',
    type: 'number',
    default: 80,
    coerce: function(port) {
      if (port < 0) {
        throw new Error('Port too low')
      } else if (port > 65535) {
        throw new Error('Port too big')
      } else {
        return port
      }
    },
  })
  .command('$0 [--port <port>] <path>', 'Serve path', function(argv) {
    return argv.positional('path', {
      describe: 'Root path to serve',
      type: 'string',
      demand: true,
      coerce: function(path) {
        if (!fs_1.existsSync(path)) {
          throw new Error('Path does not exist')
        } else {
          return path_1.resolve(path)
        }
      },
    })
  })
  .help().argv
server_1.createSPAServer({
  port: opts.port,
  distFolder: opts.path,
})
