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
  envs: ['NODE_ENV'],
}
