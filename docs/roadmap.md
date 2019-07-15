## MVP

- [x] multiple paths
- [x] caching
- [x] compression
- [x] healthcheck EP
- [x] helmet hardening
- [x] logging in apache format
- [x] dockerfile preset
- [x] CI build, lint, test
- [ ] readme explaining reasons why this exists and different use cases
- [ ] ENV injection based on whitelist
- [x] publish to NPM
- [ ] global error handling

## 1.0

- [ ] logging in nginx format
- [ ] path presets
  - [ ] automatic discovery preset
  - [ ] CRA preset
  - [ ] Nuxt preset
  - [ ] Next preset
  - [ ] Gatsby preset
- [ ] deployment presets
  - [ ] kubernetes preset
- [ ] proxy support
- [ ] extensibility
  - [ ] sentry example
  - [ ] additional page example
  - [ ] db example
- [ ] graceful shutdown
- [ ] make everything configurable by environment variables
- [ ] config validation
- [ ] preload files into memory
  - [ ] etags from hashes in filename
  - [ ] etags from checksums if filename has no hash
- [ ] CI automated NPM publising
  - [ ] build spa-prod docker image
- [ ] CSP
  - [ ] manual CSP
  - [ ] automatic CSP for scripts
  - [ ] CSP for inline scripts
  - [ ] nonce injection into webpack

## future

- [ ] tracing and reports into centralised solution
  - [ ] prometheus example
- [ ] multiple entrypoints
- [ ] single executable packaging
  - [ ] publish to github releases by CI
  - [ ] build spa-prod docker image with a tag
