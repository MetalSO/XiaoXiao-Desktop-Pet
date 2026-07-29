import { app, BrowserWindow, ipcMain } from 'electron';
import type { Bounds, PointerScreenPoint, PetConfig } from '../shared/types';
import { getConfig, saveConfig } from './store';
import { notifyConfigChanged, setWindowAlwaysOnTop } from './window';
import { showPetMenu } from './menu';

type DragState = {
  start: PointerScreenPoint;
  bounds: Bounds;
};

let dragState: DragState | null = null;

export function registerIpc(win: BrowserWindow): void {
  ipcMain.handle('pet:get-config', () => getConfig());

  ipcMain.handle('pet:save-config', (_event, patch: Partial<PetConfig>) => {
    const next = saveConfig(patch);
    notifyConfigChanged(win);
    return next;
  });

  ipcMain.handle('pet:set-always-on-top', (_event, alwaysOnTop: boolean) =>
    setWindowAlwaysOnTop(win, alwaysOnTop)
  );

  ipcMain.on('pet:show-context-menu', () => showPetMenu(win));

  ipcMain.on('pet:drag-start', (_event, point: PointerScreenPoint) => {
    dragState = {
      start: point,
      bounds: win.getBounds()
    };
  });

  ipcMain.on('pet:drag-move', (_event, point: PointerScreenPoint) => {
    if (!dragState) {
      return;
    }

    const x = Math.round(dragState.bounds.x + point.screenX - dragState.start.screenX);
    const y = Math.round(dragState.bounds.y + point.screenY - dragState.start.screenY);
    win.setPosition(x, y, false);
  });

  ipcMain.on('pet:drag-end', () => {
    dragState = null;
    saveConfig({ bounds: win.getBounds() });
    notifyConfigChanged(win);
  });

  ipcMain.on('pet:quit', () => app.quit());
}
