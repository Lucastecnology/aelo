import { app, BrowserWindow, ipcMain } from 'electron';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import path from 'path';
import isDev from 'electron-is-dev';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // For a custom title bar look
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Changed from true
      contextIsolation: true, // Changed from false
    },
    backgroundColor: '#0a0a0c', // Deep dark matching our theme
  });

  const url = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(app.getAppPath(), 'dist', 'index.html')}`;

  win.loadURL(url);

  ipcMain.on('window-close', () => win.close());
  ipcMain.on('window-minimize', () => win.minimize());
  ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });

  // Check for updates
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  // Update events
  autoUpdater.on('update-available', () => {
    win.webContents.send('update_available');
  });

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update_downloaded');
  });

  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.on('app-relaunch', () => {
    app.relaunch();
    app.exit();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
