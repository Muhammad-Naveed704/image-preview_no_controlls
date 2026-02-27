/// <reference types="vite/client" />

/** Exposed by preload. Single-image only via "Open with"; no openFolder (security). */
interface ElectronAPI {
  platform: string;
  getInitialOpenFolder: () => Promise<{
    images: Array<{ path: string; name: string; size?: number; fileUrl: string }>;
    initialIndex: number;
  } | null>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
