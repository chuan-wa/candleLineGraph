var electron = require('electron')

var app = electron.app
var BrowserWindow = electron.BrowserWindow

var mainWindow = null
try {
	require('electron-reloader')(module);
} catch {}

app.on('ready', () => {
    mainWindow = new BrowserWindow({ 
        width: 500, 
        height: 500,
        webPreferences:{nodeIntegration:true,
        contextIsolation:false}
     })
    mainWindow.loadFile('index.html')
    mainWindow.on('close', () => {
        mainWindow = null
    })
})