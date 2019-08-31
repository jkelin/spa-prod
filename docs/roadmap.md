## MVP

- [x] multiple paths
- [x] caching
- [x] compression
- [x] healthcheck EP
- [x] helmet hardening
- [x] logging in apache format
- [x] dockerfile preset
- [x] CI build, lint, test
- [x] readme explaining reasons why this exists and different use cases
- [x] ENV injection based on whitelist
- [x] publish to NPM
- [x] global error handling

## 1.0

- [ ] outdated browser detection and page
- [x] script prefetch
- [ ] custom headers
- [x] optionally disable source maps
- [x] optionally hide x-powered-by
- [x] basic auth
- [x] ~path presets~ - reverted. Now available as example configs
  - [x] CRA preset
- [ ] deployment presets
  - [ ] kubernetes preset
- [ ] optional git commit hash into healthcheck
- [ ] proxy support
- [x] graceful shutdown
- [x] ~make everything configurable by environment variables~ - reverted. Too complicated and bad fit
- [x] config validation
- [ ] preload files into memory
  - [ ] etags from hashes in filename
  - [ ] etags from checksums if filename has no hash
- [x] CI automated NPM publising
  - [x] build spa-prod docker image
- [x] [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
  - [x] manual CSP
  - [x] Nonce CSP for scripts with strict-dynamic
  - [x] Hash CSP for inline scripts
  - [ ] nonce injection into webpack
  - [x] report only
- [x] [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [ ] [Retry-After header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After)
- [ ] [SourceMap header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/SourceMap)

## future

- [ ] differential render
- [ ] prerender using headless chrome
- [ ] ssr compatibility
  - [ ] next
- [ ] path presets
  - [ ] automatic discovery preset
  - [ ] Nuxt preset
  - [ ] Next preset
  - [ ] Gatsby preset
- [ ] index templating
- [ ] javascript disabled page - custom html for when javascript is disabled that will be injected into main html?
- [ ] tracing and reports into centralised solution
  - [ ] prometheus example
- [ ] multiple entrypoints
- [ ] extensibility
  - [ ] sentry example
  - [ ] additional page example
  - [ ] db example
- [ ] auth delegation
  - [ ] OAuth
  - [ ] SAML
- [ ] logging in nginx format
- [ ] single executable packaging
  - [ ] publish to github releases by CI
  - [ ] build spa-prod docker image with a tag
