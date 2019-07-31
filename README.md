[![npm](https://img.shields.io/npm/v/spa-prod.svg)](https://www.npmjs.com/package/spa-prod) [![pipeline status](https://gitlab.com/jkelin/spa-prod/badges/master/pipeline.svg)](https://gitlab.com/jkelin/spa-prod/pipelines) [![codecov](https://codecov.io/gh/jkelin/spa-prod/branch/master/graph/badge.svg)](https://codecov.io/gh/jkelin/spa-prod) [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/fireantik/spa-prod.svg)](https://hub.docker.com/r/fireantik/spa-prod)

# SPA-PROD (Work In Progress)

[Examples](/example) • [NPM](https://www.npmjs.com/package/spa-prod) • [Docker Hub](https://hub.docker.com/r/fireantik/spa-prod) • [Roadmap](/docs/roadmap.md) • [Changelog](/docs/changelog.md)

SPA-PROD is a production sever for [Single Page Applications (SPAs)](https://en.wikipedia.org/wiki/Single-page_application). SPA-PROD offers best practices, security, performance and ease of use when hosting SPAs.

## Why is this needed?

[Single Page Applications (SPAs)](https://en.wikipedia.org/wiki/Single-page_application) are popular these days but best practices and guides around their deployment and production use seem insufficient to me. From my perspective dominant deployment strategy today is building your SPA into a set of assets (js, css, html, ...) that are strictly static, including compiled in environment variables and configuration that the application needs. These static assets are then taken and served by a static host like a CDN or S3, or served by a static server like Serve, Apache or Nginx.

#### Issues and oversights with conventional approaches:

1. Each change to configuration requires a full recomplilation (which for a modern CI pipeline can take tens of minutes)
2. Deployment has misconfigured caching, usually by oversight - immutable files with hashes in their names are missing proper headers. Do note that different files have different requirements. You want to cache your index.html for a different period than your
3. Healthcheck and diagnostic endpoints are missing (sometimes index.html is used instead, which seems wasteful and bad practice)
4. [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) is not configured, which is a shame because CSP is very effective in protecting against [Cross Site Scripting (XSS)](https://cs.wikipedia.org/wiki/Cross-site_scripting). If CSP is configured, it is managed manually which is either unsecure or bothersome

SPA-PROD project aims to fix these issues and more in a single easy to use package

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

## Features

### Caching

SPA-PROD adds headers for correct client-side caching like `Cache-Control`, `Pragma`, `Expires` and `Etag`. Specific caching time depends on your choosen preset or custom folder configuration (see below).

### Root and presets

Easiest way to use SPA-PROD with a common preset (like [Create React APP](https://facebook.github.io/create-react-app/)) is to configure a root folder (`--root` or `SPA_PROD_ROOT`) and a preset type (`--preset` or `SPA_PROD_PRESET`). Available presets are:

- `none` (default) - Serve root without presets with only short time caching. **Do not use this**, it removes greatest benefit of SPA-PROD
- `cra` - [Create React APP](https://facebook.github.io/create-react-app/)

### Custom folders

You should rather use custom folder configuration if you are not using a common preset. To do this use a config file [config.json](/example/config.json) which you activate using `--config config.json`. Please refer to [types.ts](/src/types.ts) `SPAServerFolder` for specific configuration.

### Environment variable injection

You can inject whitelisted environment variables from host into the generated index.html. This is especially useful if you need per environment configuration like base URLs or logging levels. First you need to specify environment variable whitelist using `--envs` or `SPA_PROD_ENVS`. Envs are comma separated, for example `SPA_PROD_ENVS=NODE_ENV,BASE_URL`.

By default environment variables are injected into a script that evaluates into global `window.__env` object, which you can later read in your own scripts. If you wish to change this, you can do so using `--envsPropertyName` or `SPA_PROD_ENVSPROPERTYNAME`.

### Prefetch tag injection

Enabled by default, prefetch injection adds `<link rel="prefetch">` tags for your styles and scripts into the `index.html` file. This can be disabled using `--prefetch=false` or `SPA_PROD_PREFETCH=false`.

### Source map hiding

It is possible to configure that [source map](https://blog.teamtreehouse.com/introduction-source-maps) urls will return 403 FORBIDDEN error. This is great for production because your whole source code can be reconstructed from source maps. However sourcemaps are an amazing tool for development, so **it is recommended you disable them ONLY on production environments** by using `--sourceMaps=false` or `SPA_PROD_SOURCEMAPS=false`.

### Healthcheck endpoints

It is common to add special endpoints for determining if service is healthy or not. This is doubly useful for orchestration tools like Docker Swarm or Kubernetes. SPA-PROD adds a default healthcheck endpoint at `/healthz`, this can be configured or disabled (by setting `false` or `null`) using `--healthcheck` or `SPA_PROD_HEALTHCHECK`. You can also pass a path to serve healthcheck from, for example `SPA_PROD_HEALTHCHECK=/diag/health`. Please refer to [types.ts](/src/types.ts) for detailed configuration like custom healthcheck objects or functions.

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
