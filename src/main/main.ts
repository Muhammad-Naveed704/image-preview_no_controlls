/**
 * Electron main process entry point.
 * Uses file:// URLs for images (like classic image viewers). No custom protocol.
 * Window always loads from file so img[src=file://...] works.
 */

import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'node:url';

/** Allowed image extensions: JPG, PNG, WebP, BMP, GIF, TIFF, ICO */
const IMAGE_EXT = new Set([
  '.jpg', '.jpeg', '.png', '.webp',
  '.bmp', '.gif', '.tiff', '.tif', '.ico',
]);

/** When app is opened via "Open with" an image file, store folder + initial index for renderer */
let pendingInitialOpen: {
  images: Array<{ path: string; name: string; size?: number; fileUrl: string }>;
  initialIndex: number;
} | null = null;

/** Get file path from argv when user does "Open with" (Windows / macOS) */
function getFilePathFromArgv(): string | null {
  const args = process.argv.slice(1);
  for (const arg of args) {
    const p = arg.replace(/^["']|["']$/g, '').trim();
    if (!p || p.startsWith('-')) continue;
    try {
      const stat = fs.statSync(p);
      if (!stat.isFile()) continue;
      const ext = path.extname(p).toLowerCase();
      if (IMAGE_EXT.has(ext)) return path.normalize(p);
    } catch {
      continue;
    }
  }
  return null;
}

/** Development: open DevTools; always load from built renderer (file://) so images work */
const isDev = process.env.NODE_ENV === 'development' && !app.isPackaged;

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 640,
    minHeight: 480,
    backgroundColor: '#0d0d0d',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: false,
    },
    title: 'Image Previewer',
  });

  // Always load from built file so origin is file:// and file:// images work
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  if (isDev) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.on('context-menu', (e) => e.preventDefault());
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

function scanFolderForImages(dirPath: string): Array<{ path: string; name: string; size?: number; fileUrl: string }> {
  const results: Array<{ path: string; name: string; size?: number; fileUrl: string }> = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const ent of entries) {
    if (!ent.isFile()) continue;
    const ext = path.extname(ent.name).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    const fullPath = path.join(dirPath, ent.name);
    let size: number | undefined;
    try {
      const stat = fs.statSync(fullPath);
      size = stat.size;
    } catch {
      continue;
    }
    const normalized = path.normalize(fullPath);
    const fileUrl = pathToFileURL(normalized).href;
    results.push({ path: normalized, name: ent.name, size, fileUrl });
  }

  results.sort((a, b) => a.name.localeCompare(b.name));
  return results;
}

app.whenReady().then(() => {
  const filePath = getFilePathFromArgv();
  if (filePath) {
    const folderPath = path.dirname(filePath);
    const folderImages = scanFolderForImages(folderPath);
    const initialIndex = folderImages.findIndex((img) => path.normalize(img.path) === path.normalize(filePath));
    if (folderImages.length > 0 && initialIndex >= 0) {
      pendingInitialOpen = { images: [folderImages[initialIndex]], initialIndex: 0 };
    }
  }

  ipcMain.handle('get-initial-open-folder', () => {
    const p = pendingInitialOpen;
    pendingInitialOpen = null;
    return p ?? null;
  });

  const menuTemplate: Electron.MenuItemConstructorOptions[] = [
    { label: 'File', submenu: [{ role: 'quit' }] },
    {
      label: 'View',
      submenu: [
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { role: 'resetZoom', label: 'Actual Size' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toggle Full Screen' },
      ],
    },
    { label: 'Window', submenu: [{ role: 'minimize' }, { role: 'close' }] },
    { label: 'Help', submenu: [] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
