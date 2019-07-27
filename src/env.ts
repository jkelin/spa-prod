import { SPAServerConfig } from './types'
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

export function injectEnvsIntoHtml(config: SPAServerConfig, envs: Record<string, any>, html: string) {
  if (!config.envs || config.envs.length === 0) {
    return html
  }

  const encoded = Buffer.from(JSON.stringify(envs)).toString('base64')
  const script = `<script>${config.envsPropertyName || 'window.__env'}=JSON.parse(atob("${encoded}"))</script>`

  return html.replace('<head>', `<head>${script}`)
}
