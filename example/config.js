module.exports = {
  port: 8080,
  folders: [
    {
      root: 'dist/static',
      path: '/static',
      cache: 'immutable',
    },
    {
      root: 'dist',
      cache: 'short',
    },
  ],
  index: 'dist/index.html',
  csp: true,
  envs: ['NODE_ENV'],
}
