import { contextBridge, ipcRenderer } from 'electron';

// 安全地暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  startIntercept: (url: string) => ipcRenderer.invoke('start-intercept', url),
  loadWebview: (callback: (url: string) => void) => {
    ipcRenderer.on('load-webview', (event, url) => callback(url));
  },
});