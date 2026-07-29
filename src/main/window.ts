import { BrowserWindow, screen } from 'electron';
import { join } from 'node:path';
import type { Bounds, PetConfig } from '../shared/types';
import { getConfig, saveConfig, clampScale } from './store';

export const BASE_WINDOW_WIDTH = 360;
export const BASE_WINDOW_HEIGHT = 560;

export function createPetWindow(): BrowserWindow {
  const config = getConfig();
  const bounds = config.bounds ?? getDefaultBounds(config.scale);

  const win = new BrowserWindow({
    ...bounds,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    alwaysOnTop: config.alwaysOnTop,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.setMenuBarVisibility(false);
  applyAlwaysOnTop(win, config.alwaysOnTop);

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }

  win.on('move', () => saveConfig({ bounds: win.getBounds() }));

  return win;
}

export function getDefaultBounds(scale = 1): Bounds {
  const { workArea } = screen.getPrimaryDisplay();
  const width = Math.round(BASE_WINDOW_WIDTH * scale);
  const height = Math.round(BASE_WINDOW_HEIGHT * scale);

  return {
    width,
    height,
    x: Math.round(workArea.x + workArea.width - width - 36),
    y: Math.round(workArea.y + workArea.height - height - 24)
  };
}

export function resetWindowPosition(win: BrowserWindow): PetConfig {
  const config = getConfig();
  const bounds = getDefaultBounds(config.scale);
  win.setBounds(bounds);
  const next = saveConfig({ bounds });
  notifyConfigChanged(win);
  return next;
}

export function changeWindowScale(win: BrowserWindow, delta: number): PetConfig {
  const current = getConfig();
  const nextScale = clampScale(current.scale + delta);
  const oldBounds = win.getBounds();
  const width = Math.round(BASE_WINDOW_WIDTH * nextScale);
  const height = Math.round(BASE_WINDOW_HEIGHT * nextScale);
  const nextBounds = {
    width,
    height,
    x: oldBounds.x + oldBounds.width - width,
    y: oldBounds.y + oldBounds.height - height
  };

  win.setBounds(nextBounds);
  const next = saveConfig({ scale: nextScale, bounds: nextBounds });
  notifyConfigChanged(win);
  return next;
}

export function setWindowAlwaysOnTop(win: BrowserWindow, alwaysOnTop: boolean): PetConfig {
  applyAlwaysOnTop(win, alwaysOnTop);
  const next = saveConfig({ alwaysOnTop });
  notifyConfigChanged(win);
  return next;
}

export function applyAlwaysOnTop(win: BrowserWindow, alwaysOnTop: boolean): void {
  win.setAlwaysOnTop(alwaysOnTop, 'screen-saver');
  win.setVisibleOnAllWorkspaces(alwaysOnTop, { visibleOnFullScreen: true });
}

export function notifyConfigChanged(win: BrowserWindow): void {
  if (!win.isDestroyed()) {
    win.webContents.send('pet:config-changed', getConfig());
  }
}
