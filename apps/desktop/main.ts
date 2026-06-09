import { app, BrowserWindow, shell, ipcMain, safeStorage } from 'electron';
import * as path from 'path';
import * as net from 'net';
import * as fs from 'fs';

// Reference to main window
let mainWindow: BrowserWindow | null = null;

// API port
let apiPort = 8787;

/**
 * Find an available port
 */
function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      // Port in use, try next
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

/**
 * Start the API server
 */
async function startApiServer(): Promise<number> {
  const port = await findAvailablePort(8787);
  
  // Dynamic import to avoid issues with ESM/CJS (transpiled as require in CJS)
  const { startServer } = await (eval('import("@cetakdocs/api")') as Promise<any>);
  await startServer(port);
  
  return port;
}

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'CetakDocs',
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'default',
    autoHideMenuBar: true,
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL(`http://localhost:5173`);
    // Open DevTools in dev mode
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const webPath = path.join(process.resourcesPath, 'web', 'index.html');
    mainWindow.loadFile(webPath);
  }

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Secure Storage file path
const getStoreFilePath = () => path.join(app.getPath('userData'), 'secure-store.json');

function readSecureStore(): Record<string, string> {
  try {
    const storeFilePath = getStoreFilePath();
    if (fs.existsSync(storeFilePath)) {
      const data = fs.readFileSync(storeFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read secure store:', err);
  }
  return {};
}

function writeSecureStore(store: Record<string, string>) {
  try {
    const storeFilePath = getStoreFilePath();
    fs.writeFileSync(storeFilePath, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write secure store:', err);
  }
}

// Register IPC handlers
function registerIpcHandlers() {
  ipcMain.handle('app:version', () => {
    return app.getVersion();
  });

  ipcMain.handle('secure:set', (event, key: string, value: string) => {
    if (!safeStorage.isEncryptionAvailable()) {
      const store = readSecureStore();
      store[key] = Buffer.from(value).toString('base64');
      writeSecureStore(store);
      return true;
    }
    try {
      const encryptedBuffer = safeStorage.encryptString(value);
      const store = readSecureStore();
      store[key] = encryptedBuffer.toString('hex');
      writeSecureStore(store);
      return true;
    } catch (err) {
      console.error('Failed to encrypt:', err);
      return false;
    }
  });

  ipcMain.handle('secure:get', (event, key: string) => {
    const store = readSecureStore();
    const encryptedHex = store[key];
    if (!encryptedHex) return null;
    
    if (!safeStorage.isEncryptionAvailable()) {
      return Buffer.from(encryptedHex, 'base64').toString('utf8');
    }
    try {
      const encryptedBuffer = Buffer.from(encryptedHex, 'hex');
      const decryptedString = safeStorage.decryptString(encryptedBuffer);
      return decryptedString;
    } catch (err) {
      console.error('Failed to decrypt:', err);
      return null;
    }
  });

  ipcMain.handle('secure:delete', (event, key: string) => {
    const store = readSecureStore();
    if (key in store) {
      delete store[key];
      writeSecureStore(store);
      return true;
    }
    return false;
  });

  ipcMain.handle('print', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.webContents.print({ silent: false, printBackground: true });
      return true;
    }
    return false;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  console.log('🖥️  CetakDocs Desktop memulai...');
  
  registerIpcHandlers();
  
  try {
    // Start API server first
    apiPort = await startApiServer();
    console.log(`✅ API server berjalan di port ${apiPort}`);
    
    // Then create window
    createWindow();
  } catch (err) {
    console.error('❌ Gagal memulai:', err);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: prevent new window creation
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, url) => {
    // Allow navigation to our own pages and api server
    const allowed = ['http://localhost'];
    if (!allowed.some(a => url.startsWith(a))) {
      event.preventDefault();
    }
  });
});
