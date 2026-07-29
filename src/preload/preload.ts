import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopPetApi, PetConfig, PointerScreenPoint } from '../shared/types';

const api: DesktopPetApi = {
  getConfig: () => ipcRenderer.invoke('pet:get-config'),
  saveConfig: (patch: Partial<PetConfig>) => ipcRenderer.invoke('pet:save-config', patch),
  showContextMenu: () => ipcRenderer.send('pet:show-context-menu'),
  setAlwaysOnTop: (alwaysOnTop: boolean) => ipcRenderer.invoke('pet:set-always-on-top', alwaysOnTop),
  startDrag: (point: PointerScreenPoint) => ipcRenderer.send('pet:drag-start', point),
  dragMove: (point: PointerScreenPoint) => ipcRenderer.send('pet:drag-move', point),
  endDrag: () => ipcRenderer.send('pet:drag-end'),
  quitApp: () => ipcRenderer.send('pet:quit'),
  onConfigChanged: (callback: (config: PetConfig) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, config: PetConfig) => callback(config);
    ipcRenderer.on('pet:config-changed', listener);
    return () => ipcRenderer.removeListener('pet:config-changed', listener);
  }
};

contextBridge.exposeInMainWorld('desktopPet', api);
