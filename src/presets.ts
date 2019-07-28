import { SPAServerConfig, Preset, CacheType } from './types'
import { join } from 'path'

function presetNone(config: SPAServerConfig): SPAServerConfig {
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

export async function applyPresets(config: SPAServerConfig): Promise<SPAServerConfig> {
  if (!config.preset || !config.root || config.folders) {
    return config
  }

  switch (config.preset) {
    case Preset.None:
      return presetNone(config)
    case Preset.CRA:
      return presetCRA(config)
    default:
      throw new Error(`Uknown preset ${config.preset}`)
  }
}
