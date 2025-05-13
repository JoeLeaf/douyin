import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws'; // 引入 WebSocket 客户端库
import protobuf from 'protobufjs';
import fs from 'fs';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载 douyin.proto 文件
const protoPath = path.join(__dirname, '../src/assets/douyin.proto');
let root: protobuf.Root | null = null;
try {
  const protoContent = fs.readFileSync(protoPath, 'utf-8');
  root = protobuf.parse(protoContent).root;
  console.log('Proto 文件加载成功');
} catch (err) {
  console.error('加载 proto 文件失败:', err);
}

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
        headers: details.requestHeaders, 
      });

      ws.binaryType = 'arraybuffer'; 

      ws.on('open', () => {
        console.log('WebSocket 连接已建立:', details.url);
        setInterval(() => {
          ws.send(Buffer.from('3a026862', 'hex'));
        }, 10*1000);
      });

      ws.on('message', (data: WebSocket.RawData) => {
        if (data instanceof ArrayBuffer) {
          const buffer = Buffer.from(data);
          if (root) {
            try {
              const Response = root.lookupType('douyin.PushFrame');
              const decodedMessage = Response.decode(buffer);
              //这里忘记了是那个值判断是否可以解密了，你看着来
              try {
                const payload=Buffer.from(decodedMessage.payload, 'base64');
                const decompressed = zlib.gunzipSync(payload);
                const ResponseMsg = root.lookupType('douyin.Response'); 
                const message2 = ResponseMsg.decode(decompressed);
                // console.log('解码后的消息:', JSON.stringify(message2, null, 2));
                const messagesList = message2.messagesList;
                switch (messagesList.method) {
                  case "WebcastChatMessage":
                    const ChatMessage = root.lookupType('douyin.ChatMessage'); 
                    ChatMessage.decode(Buffer.from(messagesList.payload, 'base64'));
                    console.log(ChatMessage);
                    break;
                
                  default:
                    break;
                }
              } catch (error) {
                
              }

            } catch (decodeError) {
              console.error('解码 proto 消息失败:', decodeError);
            }
          } else {
            console.error('Proto 文件尚未加载，无法解码消息');
          }
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