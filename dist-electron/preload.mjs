"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  startIntercept: (url) => electron.ipcRenderer.invoke("start-intercept", url),
  loadWebview: (callback) => {
    electron.ipcRenderer.on("load-webview", (event, url) => callback(url));
  }
});
