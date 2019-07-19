[![npm](https://img.shields.io/npm/v/spa-prod.svg)](https://www.npmjs.com/package/spa-prod) [![Build Status](https://travis-ci.com/jkelin/spa-prod.svg?branch=master)](https://travis-ci.com/jkelin/spa-prod) [![codecov](https://codecov.io/gh/jkelin/spa-prod/branch/master/graph/badge.svg)](https://codecov.io/gh/jkelin/spa-prod) [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/fireantik/spa-prod.svg)](https://hub.docker.com/r/fireantik/spa-prod)

# SPA-PROD (Work In Progress)

[Roadmap](/docs/roadmap.md) • [Changelog](/docs/changelog.md) • [Examples](/examples) • [NPM](https://www.npmjs.com/package/spa-prod) • [Docker Hub](https://hub.docker.com/r/fireantik/spa-prod)

Production sever for [Single Page Applications (SPAs)](https://en.wikipedia.org/wiki/Single-page_application)

## What is this?

This project is a consolidation of my experience when deploying SPAs and trying to appease security auditors (who want [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)), performance minded people (who want proper caching), developers (who want to change configuration without waiting tens of minutes for deployment), operators (who need healthchecks) and stakeholders (who want to fix misconfiguration ASAP). SPA-PROD collects best practices for production hosting of SPA applications into a single, reusable and extensible package.

## Why is this needed?

[Single Page Applications (SPAs)](https://en.wikipedia.org/wiki/Single-page_application) are popular these days but best practices and guides around their deployment and production use seem insufficient to me. From my perspective dominant deployment strategy today is building your SPA into a set of assets (js, css, html, ...) that are strictly static, including compiled in environment variables and configuration that the application needs. These static assets are then taken and served by a static host like a CDN or S3, or served by a static server like Serve, Apache or Nginx. There usually are however numerous oversights with this approach:

1. Each change to configuration requires a full recomplilation (which for a modern CI pipeline can take tens of minutes)
2. Deployment has misconfigured caching, usually by oversight - immutable files with hashes in their names are missing proper headers. Do note that different files have different requirements. You want to cache your index.html for a different period than your
3. Healthcheck and diagnostic endpoints are missing (sometimes index.html is used instead, which seems wasteful and bad practice)
4. [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) is not configured, which is a shame because CSP is very effective in protecting against [Cross Site Scripting (XSS)](https://cs.wikipedia.org/wiki/Cross-site_scripting). If CSP is configured, it is managed fully manually which is either unsecure or bothersome

SPA-PROD project aims to fix these oversights and more in a single easy to use package

## How do I use SPA-PROD?

There are multiple ways to serve an SPA using SPA-PROD, pick the one thats fits your environment best.

### Deploy using Docker image (when deploying using Docker)

TODO

### Deploy using NPM package (when you cannot deploy using docker, but your project uses Node.js)

TODO

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
