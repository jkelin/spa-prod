#!/usr/bin/env node

import { startServerFromCli } from './util'

try {
  const lastArg = process.argv[process.argv.length - 1]
  startServerFromCli(__filename === lastArg ? process.env.SPA_PROD_CONFIG : lastArg)
} catch (err) {
  console.error(err.message || err)
  process.exit(1)
}
