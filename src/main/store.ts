import { app } from 'electron';
import { dirname, join } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { PetConfig } from '../shared/types';

const defaultConfig: PetConfig = {
  scale: 1,
  alwaysOnTop: true
};

let cache: PetConfig | null = null;

function configPath(): string {
  return join(app.getPath('userData'), 'pet-config.json');
}

function readConfigFile(): PetConfig {
  const file = configPath();

  if (!existsSync(file)) {
    return defaultConfig;
  }

  try {
    const parsed = JSON.parse(readFileSync(file, 'utf-8')) as Partial<PetConfig>;
    return {
      ...defaultConfig,
      ...parsed,
      scale: clampScale(parsed.scale ?? defaultConfig.scale),
      alwaysOnTop: parsed.alwaysOnTop ?? defaultConfig.alwaysOnTop
    };
  } catch {
    return defaultConfig;
  }
}

export function getConfig(): PetConfig {
  if (!cache) {
    cache = readConfigFile();
  }

  return cache;
}

export function saveConfig(patch: Partial<PetConfig>): PetConfig {
  cache = {
    ...getConfig(),
    ...patch,
    scale: clampScale(patch.scale ?? getConfig().scale)
  };

  const file = configPath();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(cache, null, 2), 'utf-8');

  return cache;
}

export function clampScale(scale: number): number {
  return Math.min(1.45, Math.max(0.7, Number(scale.toFixed(2))));
}
