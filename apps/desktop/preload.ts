import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script — exposes safe APIs to the renderer process.
 * The renderer (web app) can access these via `window.cetakdocs`.
 */
contextBridge.exposeInMainWorld('cetakdocs', {
  // Platform info
  platform: process.platform,
  isElectron: true,

  // App version
  getVersion: () => ipcRenderer.invoke('app:version'),

  // Safe storage for API keys (encrypted by OS)
  secureStore: {
    set: (key: string, value: string) => ipcRenderer.invoke('secure:set', key, value),
    get: (key: string) => ipcRenderer.invoke('secure:get', key),
    delete: (key: string) => ipcRenderer.invoke('secure:delete', key),
  },

  // Print current page
  print: () => ipcRenderer.invoke('print'),
});
