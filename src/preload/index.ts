import { electronBridge } from './bridge';

// Electron Preload Script with ContextBridge
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { contextBridge, ipcRenderer } = require('electron');
  if (contextBridge) {
    contextBridge.exposeInMainWorld('ipcRenderer', {
      invoke: (channel: string, payload?: unknown) => ipcRenderer.invoke(channel, payload),
    });
    contextBridge.exposeInMainWorld('electronAPI', electronBridge);
  }
} catch {
  // Web preview mode fallback
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).electronAPI = electronBridge;
  }
}

export { electronBridge };
