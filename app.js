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

const newViewerWindow = (url, hierarchy) => {
  mainWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    width: 800,
    height: 1000
  });
  mainWindow.loadURL(url);
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('newdata', hierarchy);
  });

  mainWindow.on('closed', () => app.quit());
};

ipcMain.on('filter:inout:sunburst', (event, hierarchy) => {
  newViewerWindow(`file://${__dirname}/inoutSunburst.html`, hierarchy);
});

ipcMain.on('filter:inout:treemap', (event, hierarchy) => {
  newViewerWindow(`file://${__dirname}/inoutTreemap.html`, hierarchy);
});


ipcMain.on('filter:proc:treemap', (event, hierarchy) => {
  newViewerWindow(`file://${__dirname}/procTreemap.html`, hierarchy);
});
