import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron';
import { resolveAssetPath } from './assets';
import { changeWindowScale, resetWindowPosition, setWindowAlwaysOnTop } from './window';
import { getConfig } from './store';

let tray: Tray | null = null;

export function showPetMenu(win: BrowserWindow): void {
  buildPetMenu(win).popup({ window: win });
}

export function createPetTray(win: BrowserWindow): Tray | null {
  const image = nativeImage.createFromPath(resolveAssetPath('icons', 'tray.png'));

  if (image.isEmpty()) {
    return null;
  }

  tray = new Tray(image.resize({ width: 16, height: 16 }));
  tray.setToolTip('笑笑桌宠');
  tray.setContextMenu(buildTrayMenu(win));
  tray.on('click', () => toggleVisibility(win));

  return tray;
}

function buildPetMenu(win: BrowserWindow): Menu {
  const config = getConfig();

  return Menu.buildFromTemplate([
    {
      label: win.isVisible() ? '隐藏' : '显示',
      click: () => toggleVisibility(win)
    },
    {
      label: '重置位置',
      click: () => resetWindowPosition(win)
    },
    { type: 'separator' },
    {
      label: '放大',
      click: () => changeWindowScale(win, 0.1)
    },
    {
      label: '缩小',
      click: () => changeWindowScale(win, -0.1)
    },
    {
      label: '始终置顶',
      type: 'checkbox',
      checked: config.alwaysOnTop,
      click: (item) => setWindowAlwaysOnTop(win, item.checked)
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => app.quit()
    }
  ]);
}

function buildTrayMenu(win: BrowserWindow): Menu {
  return Menu.buildFromTemplate([
    {
      label: win.isVisible() ? '隐藏笑笑' : '显示笑笑',
      click: () => toggleVisibility(win)
    },
    {
      label: '重置位置',
      click: () => resetWindowPosition(win)
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => app.quit()
    }
  ]);
}

function toggleVisibility(win: BrowserWindow): void {
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
    win.focus();
  }

  tray?.setContextMenu(buildTrayMenu(win));
}
