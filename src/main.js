const electron = require('electron');
const path = require('path');
const { removeListener } = require('process');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const mysql = require('./mysql/module')

const { ipcMain } = electron
// arg = 'data1' || 'data2'
ipcMain.on("requestGetData", (event, arg) => {
    //mysql.knowledgeInfo.getAllInfo
    mysql.knowledgeInfo.getAllInfo(function(data){
        event.sender.send('responseData', data);
    });
})


global.shareObject = {}
function openWindow(event , arg) {
    let pluginName;
    switch (process.platform) {
        case 'win32':
            pluginName = 'pepflashplayer.dll';
            break;
        case 'darwin':
            pluginName = 'PepperFlashPlayer.plugin';
            break;
        case 'linux':
            pluginName = 'libpepflashplayer.so';
            break;
    }
    app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));

    // Create the browser window.
    var win = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        defaultFontSize: 16,
        minWidth: 1200,
        minHeight: 800,
        icon: path.join(__dirname, 'img/icon.png'),
        defaultMonospaceFontSize: 16,
        defaultEncoding: "utf-8",
        webPreferences: {
            plugins: true,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule:true,
        }
    });
    var util = require('util');
    arg.page = arg.page || 'index.html'
    url = util.format('file://%s/%s' , __dirname , arg.page  )
    win.loadURL(url);

    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });
    global.shareObject[arg.page] = win.webContents.id
    return win;
}

app.on('ready', openWindow);
app.on("getdata",getdata);
function getdata(){

}

app.on('window-all-closed', () => {
    app.quit()
});