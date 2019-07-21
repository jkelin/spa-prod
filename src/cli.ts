#!/usr/bin/env node

import { createSPAServer } from './server'
import { readCli } from './util'

createSPAServer(readCli(process.argv))
