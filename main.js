"use strict";

const { app, BrowserWindow, screen} = require("electron");
const args = process.argv.slice(1), serve = args.some(val => val === '--serve');

let appWin;

//----------------------------------------- CREATE WINDOW ------------------------------------------------//

const createWindow = ()=>{
    const {width, height} = screen.getPrimaryDisplay().workAreaSize;

    appWin = new BrowserWindow({
        width,
        height,
        title: "Aescala",
        resizable: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    });

    if(serve){
        require('electron-reloader')(module);
        appWin.loadURL('http://localhost:4200/');
    }else{
        appWin.loadURL(`file://${__dirname}/dist/index.html`);
    }
    
    // appWin.webContents.openDevTools();
    // appWin.webContents.on('os-storage-comunication', (message)=>{
    // })

    appWin.setMenu(null);

    appWin.on("closed", () => {
        appWin = null;
    });
}

//----------------------------------------- EVENTOS ------------------------------------------------//

app.on("ready", () => setTimeout(createWindow, 400));

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
});