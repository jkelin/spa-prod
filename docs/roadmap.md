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
- [ ] optionally hide x-server
- [ ] basic auth
- [x] path presets
  - [ ] automatic discovery preset
  - [x] CRA preset
  - [ ] Nuxt preset
  - [ ] Next preset
  - [ ] Gatsby preset
- [ ] deployment presets
  - [ ] kubernetes preset
- [ ] optional git commit hash into healthcheck
- [ ] proxy support
- [x] graceful shutdown
- [x] make everything configurable by environment variables
- [x] config validation
- [ ] preload files into memory
  - [ ] etags from hashes in filename
  - [ ] etags from checksums if filename has no hash
- [x] CI automated NPM publising
  - [x] build spa-prod docker image
- [ ] CSP
  - [ ] manual CSP
  - [ ] automatic CSP for scripts
  - [ ] CSP for inline scripts
  - [ ] nonce injection into webpack
- [ ] [Retry-After header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After)
- [ ] [SourceMap header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/SourceMap)

## future

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
