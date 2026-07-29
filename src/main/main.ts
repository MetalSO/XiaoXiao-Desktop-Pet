import { app, BrowserWindow } from 'electron';
import { createPetTray } from './menu';
import { registerIpc } from './ipc';
import { createPetWindow } from './window';

let petWindow: BrowserWindow | null = null;

app.setName('笑笑桌宠');

app.whenReady().then(() => {
  petWindow = createPetWindow();
  registerIpc(petWindow);
  createPetTray(petWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      petWindow = createPetWindow();
      registerIpc(petWindow);
      createPetTray(petWindow);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
