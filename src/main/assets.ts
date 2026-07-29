import { app } from 'electron';
import { join } from 'node:path';

export function resolveAssetPath(...segments: string[]): string {
  const assetRoot = app.isPackaged ? join(process.resourcesPath, 'assets') : join(process.cwd(), 'assets');
  return join(assetRoot, ...segments);
}
