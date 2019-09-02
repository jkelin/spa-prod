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

## Indended use

SPA-PROD is intended to be placed behind another reverse proxy, like NGINX, Apache, CloudFront or Cloudflare. SPA-PROD explicitly does not handle HTTPS, HSTS and hostnames. Example chain would look like this: Internet => Cloudflare/CloudFront => Docker Swarm/Kubernetes => Reverse proxy => SPA-PROD. SPA-PROD is intended to be lowest link and do it's job well. It is not intended to replace the layers above it.

### Using via custom Docker image [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/fireantik/spa-prod.svg)](https://hub.docker.com/r/fireantik/spa-prod)

1. Create `spa-prod.config.js` config file. [Example config](/example/config.js) • [Template](/example/template.js)

   ```javascript
   module.exports = {
     port: 8080,
     folders: [
       {
         root: 'cra/build/static',
         path: '/static',
         cache: 'immutable',
       },
       {
         root: 'cra/build',
         cache: 'short',
       },
     ],
     index: 'cra/build/index.html',
     csp: true,
   }
   ```

2. Create `Dockerfile` in root of your project. Make sure to pin to a minor version in `FROM` to avoid unexpected breakage.

   ```dockerfile
   FROM fireantik/spa-prod

   # Copy configuration
   COPY ./spa-prod.config.js /app/spa-prod.config.js
   ENV SPA_PROD_CONFIG /app/spa-prod.config.js

   # Copy built files from dist directory
   COPY ./dist /app/dist
   ```

3. Build docker image for your application - `docker build --tag my-awesome-app ./`
4. Run your application - `docker run -it -p 8080:8080 my-awesome-app`

### Using via NPM package [![npm](https://img.shields.io/npm/v/spa-prod.svg)](https://www.npmjs.com/package/spa-prod)

1. `npm install --save-dev spa-prod` or `yarn add -D spa-prod`
2. Add a start script to `scripts` section of your `package.json`: `"start:prod": "spa-prod --config spa-prod.config.js"`
3. Add `spa-prod.config.js` file. [Example config](/example/config.js) • [Template](/example/template.js)
4. Run your new production server with `npm run start:prod` or `yarn start:prod`

## Features

### Caching

SPA-PROD adds headers for correct client-side caching like `Cache-Control`, `Pragma`, `Expires` and `Etag`. Specific caching time depends on your choosen preset or custom folder configuration (see below).

### Folder configuration

You need to configure served folders that your application uses. Each folder can be served from a different filesystem directory on a different HTTP path. Each folder has different caching properties. Configure these using `folders` property in your [config file](#Configuration).

### Automatic [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) configuration

If enabled (`"csp": true` property in your [config file](#Configuration)), CSP is automatically configured for scripts from index (inline or otherwise). If your scripts are using additional CSP resources, these can be configured using `csp.append`. CSP is an amazing tool in fight against XSS and it should be enabled whenever possible. If you are unsure about your CSP configuration, you can enable CSP in report-only mode using `csp.reportOnly` and `csp.reportUri`.

#### CSP nonce integration with Webpack

If you are using webpack, you will need to inject CSP nonce in one of your scripts. CSP nonce is injected into `window.__nonce` global variable. To integrate this nonce into webpack, please add `__webpack_nonce__ = window.__nonce` into one of your scripts.

### Environment variable injection

You can inject whitelisted environment variables from host into the generated index.html. This is especially useful if you need per environment configuration like base URLs or logging levels. You can whitelist environment variables using `envs` property in your [config file](#Configuration).

By default environment variables are injected into a script that evaluates into global `window.__env` object, which you can later read in your own scripts. If you wish to change this, you can do so using `envsPropertyName` property in your [config file](#Configuration).

### Prefetch tag injection

Enabled by default, prefetch injection adds `<link rel="prefetch">` tags for your styles and scripts into the `index.html` file. This can be disabled using `"prefetch": false` property in your [config file](#Configuration).

### Source map hiding

It is possible to configure that [source map](https://blog.teamtreehouse.com/introduction-source-maps) urls will return 403 FORBIDDEN error. This is great for production because your whole source code can be reconstructed from source maps. However sourcemaps are an amazing tool for development, so **it is recommended you disable them ONLY on production environments** by using `"sourceMaps":false` property in your [config file](#Configuration).

### Healthcheck endpoints

It is common to add special endpoints for determining if service is healthy or not. This is doubly useful for orchestration tools like Docker Swarm or Kubernetes. SPA-PROD adds a default healthcheck endpoint at `/healthz`, this can be configured or disabled (by setting `false` or `null`) using `healthcheck` config property. You can also pass a path to serve healthcheck from, for example `"healthcheck": "/diag/health"`. Please refer to [types.ts](/src/types.ts) for detailed configuration like custom healthcheck objects or functions.

### Basic authentication

You can add a simple [HTTP authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) with `username` and `password` config properties. This is useful for environments like DEV where you do not want to expose your work in progress. Do not use this for actual production, basic auth is not secure.

### X-Powered-By header hiding

By default SPA-PROD sends `X-Powered-By` header of `SPA-PROD, Express`. Some security scanners however deem any information about target server a vulnerability and thus flag this header. You can disable X-Powered-By header by setting `"poweredBy": false` in your [config file](#Configuration).

## Configuration

Available configuration options can be viewed in [types.ts](/src/types.ts) in the `SPAServerConfig` interface. You need to supply a `js` or `json` config file that matches this interface. Path of the config file is set using either `SPA_PROD_CONFIG` environment variable or as a last CLI argument to spa-prod executable.

See [Config Template](/example/template.js) as a starting point for your own configuration.

## FAQ

### Why not just configure all the headers in an API gateway?

Because that is a lot of headers for a lot of routes. Inevitably this configuration will get outdated over time. SPA-PROD also does more useful things like prefetch tag and environment variable injection.

### Why not just deploy using [Serve](https://www.npmjs.com/package/serve)?

It is convenient to `yarn add serve` and then when running code in production simple `yarn serve ./dist`. This approach hovever has many disadvantages.

- It does not work with history API, it will not send `/index.html` from when you ask for `/custom/path`
- Serve does not add proper caching headers
- By default it is listing directory contents
- Serve does not and cannot expose healthcheck EP (unless you make a wrap it in a NodeJS script, which defeats the purpose)
- It does not add proper security headers including CSP
- It does not inject configuration

### Why not deploy static files to S3, expose through CloudFront?

TODO

### Is SPA-PROD safe to use without reverse proxy?

No. SPA-PROD does not handle SSL termination, Node.js is subpar for applications facing internet directly. No effort has been done in SPA-PROD to prevent DDOS attacks (reverse proxy handles those) and heavy optimization.
