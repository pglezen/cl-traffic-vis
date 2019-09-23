const { app, dialog, ipcMain, BrowserWindow } = require('electron');

let mainWindow, filterWindow;


app.on('ready', function() {

  filterWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    width: 800,
    height: 500
  });
  filterWindow.loadURL(`file://${__dirname}/filter.html`);
});

ipcMain.on('filter:inout', (event, hierarchy) => {

  mainWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    width: 800,
    height: 1000
  });
  mainWindow.loadURL(`file://${__dirname}/inoutTreemap.html`);
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('newdata', hierarchy);
  });

  mainWindow.on('closed', () => app.quit());
  // filterWindow.close();

});

ipcMain.on('filter:proc', (event, hierarchy) => {

  mainWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    width: 800,
    height: 1000
  });
  mainWindow.loadURL(`file://${__dirname}/procTreemap.html`);
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('newdata', hierarchy);
  });

  mainWindow.on('closed', () => app.quit());
  // filterWindow.close();

});
