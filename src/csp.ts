import { SPAServerConfig } from './types'
import { Request, Response } from 'express'
import { toPairs, uniq } from 'lodash'
import { generateIntegrityForBuffer, IndexMiddleware } from './util'
import contentSecurityPolicyBuilder from 'content-security-policy-builder'
import { v4 } from 'uuid'

function generateCSPFromConfig(config: SPAServerConfig) {
  const csp: Record<string, string[]> = {
    'default-src': [`'self'`],
    'script-src': [`http:`, `https:`, `'unsafe-inline'`, `'strict-dynamic'`],
    'object-src': [`'none'`],
    'base-uri': [`'none'`],
  }

  if (config.csp && typeof config.csp === 'object' && config.csp.requireSri) {
    csp['require-sri-for'] = ['script', 'style']
  }

  if (config.csp && typeof config.csp === 'object' && config.csp.reportUri) {
    csp['report-uri'] = [config.csp.reportUri]
  }

  return csp
}

function generateCSPFromNonce(nonce: string) {
  return {
    'script-src': [`'nonce-${nonce}'`],
    'style-src': [`'nonce-${nonce}'`],
  }
}

function generateCSPForHtml($: CheerioStatic) {
  const inlineScripts = $('script')
    .toArray()
    .map(x => $(x).html())
    .filter(Boolean)
    .map(x => `'${generateIntegrityForBuffer(x!)}'`)

  const inlineStyles = $('style')
    .toArray()
    .map(x => $(x).html())
    .filter(Boolean)
    .map(x => `'${generateIntegrityForBuffer(x!)}'`)

  return {
    'script-src': inlineScripts,
    'style-src': inlineStyles,
  }
}

function combineCSPs(...csps: (Record<string, string[]> | undefined)[]) {
  return csps
    .filter(x => x)
    .reduce<Record<string, string[]>>((acc, cur) => {
      toPairs(cur).forEach(([k, values]) => (acc[k] = uniq((acc[k] || []).concat(values))))
      return acc
    }, {})
}

export async function createCSPIndexMiddleware(config: SPAServerConfig): Promise<IndexMiddleware> {
  const cspFromConfig = generateCSPFromConfig(config)

  return (req: Request, res: Response, $: CheerioStatic) => {
    const nonce = res.locals.nonce

    const cspFromNonce = generateCSPFromNonce(nonce)
    const cspFromHtml = generateCSPForHtml($)
    const additional = (typeof config.csp === 'object' && config.csp.append) || undefined

    const cspHeader = contentSecurityPolicyBuilder({
      directives: combineCSPs(cspFromHtml, cspFromNonce, cspFromConfig, additional),
    })

    if (typeof config.csp === 'object' && config.csp.reportOnly) {
      res.header('Content-Security-Policy-Report-Only', cspHeader)
    } else {
      res.header('Content-Security-Policy', cspHeader)
    }

    $('script[src]').attr('nonce', nonce)
    $('link[rel="stylesheet"]').attr('nonce', nonce)
  }
}

export function createNonceMiddleware(config: SPAServerConfig) {
  return (req: Request, res: Response, next: () => unknown) => {
    res.locals.nonce = v4()

    next()
  }
}

export async function createNonceIndexMiddleware(config: SPAServerConfig): Promise<IndexMiddleware> {
  return (req: Request, res: Response, $: CheerioStatic) => {
    const nonce = res.locals.nonce

    const script = `<script>window.__nonce="${nonce}"</script>`

    $('head').append(script)
  }
}
