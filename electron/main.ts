import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws'; // 引入 WebSocket 客户端库

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

  webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.url.startsWith('wss://')) {
      console.log('拦截到 wss 请求:', details.url);

      // 使用 WebSocket 客户端手动连接，添加拦截到的请求头
      const ws = new WebSocket(details.url, {
        headers: details.requestHeaders, // 使用拦截到的原始请求头
      });

      ws.binaryType = 'arraybuffer'; // 确保以二进制模式工作

      ws.on('open', () => {
        console.log('WebSocket 连接已建立:', details.url);
        ws.send(Buffer.from('3a026862', 'hex')); // 发送二进制数据
      });

      ws.on('message', (data: WebSocket.RawData) => {
        if (data instanceof ArrayBuffer) {
          const buffer = Buffer.from(data);
          console.log('收到 WebSocket 消息 (二进制):', buffer.toString('hex'));
        } else if (Buffer.isBuffer(data)) {
          console.log('收到 WebSocket 消息 (二进制):', data.toString('hex'));
        } else {
          console.log('收到 WebSocket 消息 (文本):', data.toString());
        }
      });

      ws.on('close', () => {
        console.log('WebSocket 连接已关闭:', details.url);
      });

      ws.on('error', (error: Error) => {
        console.error('WebSocket 错误:', error);
      });
      webviewWindow?.close();

      return callback({ cancel: true }); 
    }
    callback({ cancel: false }); // 不取消其他请求
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