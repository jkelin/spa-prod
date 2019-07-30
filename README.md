[![npm](https://img.shields.io/npm/v/spa-prod.svg)](https://www.npmjs.com/package/spa-prod) [![pipeline status](https://gitlab.com/jkelin/spa-prod/badges/master/pipeline.svg)](https://gitlab.com/jkelin/spa-prod/pipelines) [![codecov](https://codecov.io/gh/jkelin/spa-prod/branch/master/graph/badge.svg)](https://codecov.io/gh/jkelin/spa-prod) [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/fireantik/spa-prod.svg)](https://hub.docker.com/r/fireantik/spa-prod)

# SPA-PROD (Work In Progress)

[Roadmap](/docs/roadmap.md) • [Changelog](/docs/changelog.md) • [Examples](/example) • [NPM](https://www.npmjs.com/package/spa-prod) • [Docker Hub](https://hub.docker.com/r/fireantik/spa-prod)

Production sever for [Single Page Applications (SPAs)](https://en.wikipedia.org/wiki/Single-page_application)

## What is this?

This project is a consolidation of my experience when deploying SPAs and trying to appease security auditors (who want [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)), performance minded people (who want proper caching), developers (who want to change configuration without waiting tens of minutes for deployment), operators (who need healthchecks) and stakeholders (who want to fix misconfiguration ASAP). SPA-PROD collects best practices for production hosting of SPA applications into a single, reusable and extensible package.

## Why is this needed?

[Single Page Applications (SPAs)](https://en.wikipedia.org/wiki/Single-page_application) are popular these days but best practices and guides around their deployment and production use seem insufficient to me. From my perspective dominant deployment strategy today is building your SPA into a set of assets (js, css, html, ...) that are strictly static, including compiled in environment variables and configuration that the application needs. These static assets are then taken and served by a static host like a CDN or S3, or served by a static server like Serve, Apache or Nginx.

#### Issues and oversights with conventional approaches:

1. Each change to configuration requires a full recomplilation (which for a modern CI pipeline can take tens of minutes)
2. Deployment has misconfigured caching, usually by oversight - immutable files with hashes in their names are missing proper headers. Do note that different files have different requirements. You want to cache your index.html for a different period than your
3. Healthcheck and diagnostic endpoints are missing (sometimes index.html is used instead, which seems wasteful and bad practice)
4. [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) is not configured, which is a shame because CSP is very effective in protecting against [Cross Site Scripting (XSS)](https://cs.wikipedia.org/wiki/Cross-site_scripting). If CSP is configured, it is managed manually which is either unsecure or bothersome

SPA-PROD project aims to fix these oversights and more in a single easy to use package

## How do I use SPA-PROD?

There are multiple ways to serve an SPA using SPA-PROD, pick the one that fits your environment best.

### Docker image [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/fireantik/spa-prod.svg)](https://hub.docker.com/r/fireantik/spa-prod)

Do note that by default SPA-PROD in docker listens on 8080. [Example docker-compose.yml](/example/docker-compose.yml)

```
docker run -it -p 80:8080 \
 --mount type=bind,source="$(pwd)"/example/cra/build,target=/app,readonly \
 -e SPA_PROD_ROOT:/app \
 -e SPA_PROD_PRESET:cra \
 fireantik/spa-prod
```

You can also make your own Dockerfile with `FROM fireantik/spa-prod:latest`. [Example Dockerfile](/example/Dockerfile)

### Add SPA-PROD to your Node.js project (when you cannot deploy using docker, but your project uses Node.js) [![npm](https://img.shields.io/npm/v/spa-prod.svg)](https://www.npmjs.com/package/spa-prod)

- `npm install --save-dev spa-prod` or `yarn add -D spa-prod`
- Add a start script to `scripts` section of your `package.json`: `"start:prod": "spa-prod --config spa-prod.config.json"`
- Add `spa-prod.config.json` file. See Configuration section below. [Example JSON config](/example/config.json)
- Run your new production server with `npm run start:prod` or `yarn start:prod`

## Configuration

Available configuration options can be viewed in [types.ts](/src/types.ts) in the `SPAServerConfig` interface. There are 3 ways to customize SPA-PROD behavior:

1. CLI options (output from `--help`):
   ```
   --version           Show version number                              [boolean]
   --config            Path to JSON config file
   --port, -p          Listen port                         [number] [default: 80]
   --root              Root path to serve                                [string]
   --index             Index file path                                   [string]
   --preset            Preset to use
                             [string] [choices: "none", "cra"] [default: "none"]
   --folders           Folders to serve. If you use this, do not use `root` and
                      `preset`                                           [array]
   --healthcheck       Enable healthcheck endpoint      [boolean] [default: true]
   --prefetch          Inject prefetch links into index HTML for js and css
                      assets                           [boolean] [default: true]
   --sourceMaps        Send 403 for source maps when false. This should be set to
                      `false` in real PROD environment (but it is very useful in
                      DEV envs)                        [boolean] [default: true]
   --silent            Disable logs                    [boolean] [default: false]
   --envs              Whitelisted environment variables to inject into index
                                                           [array] [default: []]
   --envsPropertyName  Property to inject envs into
                                              [string] [default: "window.__env"]
   --help              Show help                                        [boolean]
   ```
2. Environment variables - these are the same as CLI options, but snake cased and with a "SPA_PROD" prefix. So for example `--root` would be `SPA_PROD_ROOT`
3. Configuration file - either JSON or JavaScript files will work. Use `--config <path>` or `SPA_PROD_CONFIG`. See [JSON config](/example/config.json) or [JS config](/example/config.js) examples.

### Configuration options in depth

#### Root

- `SPA_PROD_ROOT` `--root`
- Root folder to serve when [Folders](#Folders) are not configured. Very useful in conjunction with [Preset](#Preset). You should use [Folders](#Folders) for anything custom or complex.

### Preset

- `SPA_PROD_PRESET` `--preset` default: `none`
- Requires [Root](#Root) to be configured. This allows to quickly configure SPA-PROD for common starter packs.

Values:

- `none` - Serve root without presets with only short time caching. **Do not use this**, it removes greatest benefit of SPA-PROD
- `cra` - [Create React APP](https://facebook.github.io/create-react-app/)

#### Folders

- `--folders` Best to be configured using [config files](/example/config.json).
- Custom configuration for folders and their caching policies.
- Array of objects, each has properties:
  - `root` - directory where to recursively look for files
  - `path` - base HTTP path to serve from
  - `cache` - caching policy for files in this folder. You will usually want to use either `short` or `immutable`. Each policy has it's own headers
    - `none` - disable caching (useful for APIs)
    - `short` - short time caching (useful for normal files likes index.html). Currently one minute
    - `long` - long term caching. Currently 7 days
    - `immutable` - for files that never changed, usually with versions or hashes in their names. Currently one year. Adds `Cache-Control: immutable`

## Contemporary SPA deployment strategies and their issues

### Deploy using [Serve](https://www.npmjs.com/package/serve)

It is convenient to `yarn add serve` and then when running code in production simple `yarn serve ./dist`. This approach hovever has many disadvantages.

- It does not work with history API, it will not send `/index.html` from when you ask for `/custom/path`
- Serve does not add proper caching headers
- By default it is listing directory contents
- Serve does not and cannot expose healthcheck EP (unless you make a wrap it in a NodeJS script, which defeats the purpose)
- It does not add proper security headers including CSP
- It does not inject configuration

### Deploy static files to S3, expose through CloudFront

TODO
