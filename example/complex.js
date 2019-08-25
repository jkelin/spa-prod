module.exports = {
  port: 80,
  folders: [
    {
      root: 'cra/build/static',
      cache: 'immutable',
    },
    {
      root: 'cra/build',
      cache: 'short',
    },
  ],
  index: 'cra/build/index.html',
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
