const electron = require('electron');

const { app, BrowserWindow } = electron;

let mainWindow;

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    width: 800,
    height: 1000
  });
  mainWindow.loadURL(`file://${__dirname}/tm3.html`);
  mainWindow.on('closed', () => app.quit());
});
