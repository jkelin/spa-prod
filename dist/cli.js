#!/bin/sh
'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var yargs_1 = __importDefault(require('yargs'))
var fs_1 = require('fs')
var path_1 = require('path')
var server_1 = require('./server')
var util_1 = require('./util')
var opts = yargs_1.default
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
  .command('$0 [--port <port>] <root>', 'Serve path', function(argv) {
    return argv.positional('root', {
      describe: 'Root path to serve',
      type: 'string',
      demand: true,
      coerce: function(root) {
        if (!fs_1.existsSync(root)) {
          throw new Error('Root path does not exist')
        } else {
          return path_1.resolve(root)
        }
      },
    })
  })
  .help().argv
server_1.createSPAServer(
  util_1.generateSPAServerConfig({
    port: opts.port,
    root: opts.root,
  })
)
//# sourceMappingURL=cli.js.map
