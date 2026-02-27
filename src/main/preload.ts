/**
 * Preload: single-image only via "Open with". No openFolder (security).
 */

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  getInitialOpenFolder: (): Promise<{
    images: Array<{ path: string; name: string; size?: number; fileUrl: string }>;
    initialIndex: number;
  } | null> => ipcRenderer.invoke('get-initial-open-folder'),
});
