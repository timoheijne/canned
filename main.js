// Modules to control application life and create native browser window

const {app, BrowserWindow, globalShortcut, ipcMain } = require('electron')
const path = require('path')
const { clipboard } = require('electron')
const ks = require('node-key-sender');

const db = require("./database")


// setTimeout(() => {
//   db.snippet.create({name: "Test2"})
//   db.snippet.create({name: "Test3"})
// }, 2000)


let mainWindow

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    show: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      allowRunningInsecureContent: true,
    },
    
  })
  
  // and load the index.html of the app.
  mainWindow.loadFile('contents/index.html')

  mainWindow.on('show', function () {
    console.log("test")
  })
  
  // Register a 'CommandOrControl+X' shortcut listener.
  const ret = globalShortcut.register('alt+C', () => {
    mainWindow.show();
  })

  if (!ret) {
    console.log('registration failed')
  }

})

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister('alt+C')

  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})



ipcMain.on('paste-snippet', (event, args) => {
  MinimizeWindow();
  pasteText(args.body);  
});

ipcMain.on('copy-snippet', (event, args) => {
  MinimizeWindow();
  copyToClip(args.body);  
});

ipcMain.on('process-query', (event, args) => {
  // Query the database, send back results
});

ipcMain.on('create-snippet', (event, args) => {
  console.log(args)
});

ipcMain.on('update-snippet', (event, args) => {
  // Query the database, send back results
  console.log(args)
});

ipcMain.on('delete-snippet', (event, args) => {
  // Query the database, send back results
});

ipcMain.on('close-window', (event, args) => {
  MinimizeWindow();
});

function MinimizeWindow() {
  mainWindow.minimize();
  mainWindow.hide();
}

function copyToClip(text) {
  clipboard.writeText(text);
}

function pasteText(text) {
  let curClip = clipboard.readText();

  clipboard.writeText(text);
  ks.sendCombination(['control', 'v']).then(done => {
    // restore clipbloard
    clipboard.writeText(curClip)
  })
}