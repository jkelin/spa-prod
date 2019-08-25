module.exports = {
  // Listen port. Required. Do not forget to update HEALTHCHECK in your Dockerfile if you change this from 8080
  port: 8080,

  // Served folder configuration
  folders: [
    {
      // Folder on a filesystem
      root: 'cra/build/static',

      // URL for this folder
      path: '/static',

      // Which caching headers to send. Usually `immutable` for static content or `short` for everything else
      cache: 'immutable',
    },
    {
      root: 'cra/build',
      cache: 'short',
    },
  ],

  // Index html. Sent for all routes that do not match any files (to enable SPA functionality)
  index: 'cra/build/index.html',

  // Healthcheck confinguration. Could be `false`, `true` or just path as well
  // healthcheck: true,
  // healthcheck: false,
  // healthcheck: '/healthz',
  healthcheck: [
    {
      // URL to serve healthchecks on
      path: '/healthz',

      // Data to send in healtcheck
      data: function() {
        return {
          now: new Date().toISOString(),
        }
      },
    },
    {
      path: '/healthz2',
      data: {
        status: 'ok',
      },
    },
  ],

  // Enable Subresource Integrity tag injection into index for styles and scripts
  sri: true,

  // Inject prefetch links into index HTML for JS and CSS assets
  prefetch: true,

  // Send 403 for source maps when false. This should be set to `false` in real PROD environment (but `true` is very useful in DEV envs)
  sourceMaps: true,

  // Send `X-Powered-By` header (SPA-PROD, Express)
  poweredBy: true,

  // Whitelisted environment variables to be injected into index and served from healthcheck
  envs: ['NODE_ENV', 'BASE_URL'],

  // Property to inject envs into
  envsPropertyName: 'window.__env',

  // Basic authentication username and password
  username: 'admin',
  password: 'admin',

  // Enable Content Security Policy. Could be `true` or `false` as well
  // csp: true,
  // csp: false,
  csp: {
    // Additional CSP rules
    append: {
      'script-src': ['https://example.com'],
      'img-src': ['data:'],
    },

    // CSP report uri
    reportUri: 'https://example.com/CSP_REPORT',

    // Run CSP in report only mode. Requires `reportUri`
    reportOnly: false,

    // Enable `require-sri-for` directive
    requireSri: false,
  },
}
