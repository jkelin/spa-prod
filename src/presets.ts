import { SPAServerConfig, Preset, CacheType } from './types'
import { join } from 'path'

function presetAuto(config: SPAServerConfig): SPAServerConfig {
  return config
}

function presetCRA(config: SPAServerConfig): SPAServerConfig {
  const root = config.root!

  return {
    ...config,
    root: undefined,
    preset: undefined,
    folders: [
      {
        path: '/static',
        cache: CacheType.Immutable,
        root: join(root, 'static'),
      },
      {
        path: '/',
        cache: CacheType.Short,
        root: root,
      },
    ],
    index: join(root, 'index.html'),
  }
}

export function applyPresets(config: SPAServerConfig): SPAServerConfig {
  if (!config.preset || !config.root || config.folders) {
    return config
  }

  switch (config.preset) {
    case Preset.Auto:
      return presetAuto(config)
    case Preset.CRA:
      return presetCRA(config)
    default:
      throw new Error(`Uknown preset ${config.preset}`)
  }
}
