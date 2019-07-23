module.exports = {
  port: 80,
  folders: [
    {
      root: 'test/cra/static',
      cache: 'immutable',
    },
    {
      root: 'test/cra',
      cache: 'short',
    },
  ],
  index: 'test/cra/index.html',
  healthcheck: [
    {
      path: '/healthz',
      data: function() {
        return {
          now: new Date().toISOString(),
        }
      },
    },
  ],
  envs: ['NODE_ENV', 'BASE_URL'],
}
