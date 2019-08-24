import { SPAServerConfig, IndexMiddleware } from './types'
import { Request, Response } from 'express'
import { parseEnv } from './util'

export function readEnvs(config: SPAServerConfig): Record<string, any> {
  if (!config.envs || config.envs.length === 0) {
    return {}
  }

  return config.envs.reduce<Record<string, any>>((acc, cur) => {
    acc[cur] = parseEnv(process.env[cur])
    return acc
  }, {})
}

export async function createENVsIndexMiddleware(config: SPAServerConfig): Promise<IndexMiddleware> {
  const envs = readEnvs(config)

  return (req: Request, res: Response, $: CheerioStatic) => {
    const encoded = Buffer.from(JSON.stringify(envs)).toString('base64')
    const script = `<script>${config.envsPropertyName || 'window.__env'}=JSON.parse(atob("${encoded}"))</script>`

    return $('head').append(script)
  }
}
