// Modules to control application life and create native browser window

const {app, BrowserWindow, globalShortcut, ipcMain } = require('electron')
const path = require('path')
const { clipboard } = require('electron')
const ks = require('node-key-sender');

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'canned_responses.sqlite'
});

try {
  sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

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
  
  // Register a 'CommandOrControl+X' shortcut listener.
  const ret = globalShortcut.register('alt+C', () => {
    console.log('alt+C is pressed')

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

ipcMain.on('helloSync', (event, args) => {
  mainWindow.minimize();
  pasteText("Ah, Perry the Platypus, what a wonderful surprise Now that you are trapped in this huge bat soup bowl, it is time to reveal my final creation. The Coofinator! \n Now you see, it all started when I was a little boy in the Hong Kong flu outbreak of 1969. \n The disease claimed a lot of lives and I thought to myself \"this is not fair, it attracted a lot of attention but it is not even that contagious, why people help those ching chongs instead of their own darn people?!\". \n Now with the power to spread coofona in the chingchong-state area, I will take my revenge on those chinese scumbags!");  
});

function pasteText(text) {
  let curClip = clipboard.readText();

  clipboard.writeText(text);
  ks.sendCombination(['control', 'v']).then(done => {
    // restore clipbloard
    clipboard.writeText(curClip)
    console.log("Restored")
  })
}