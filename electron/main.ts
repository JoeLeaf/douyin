import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let webviewWindow: BrowserWindow | null = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.mjs'), // 确保路径正确
    },
  });
  mainWindow.webContents.openDevTools();
  mainWindow.loadFile('public/index.html');
}

function createWebviewWindow(url: string) {
  webviewWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webviewTag: false, // 禁用 webviewTag，直接使用 BrowserWindow
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });
  webviewWindow.webContents.openDevTools();
  webviewWindow.loadURL(url); // 直接加载目标 URL

  // 拦截请求
  const { webRequest } = webviewWindow.webContents.session;

  webRequest.onBeforeRequest((details, callback) => {
    console.log('请求地址： ' ,details.url);
    callback({ cancel: false }); // 不取消请求
  });

}

app.whenReady().then(() => {
  createMainWindow();

  // 监听渲染进程的 "start-intercept" 事件
  ipcMain.handle('start-intercept', (_, url: string) => {
    createWebviewWindow(url);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});