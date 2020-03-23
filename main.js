// Modules to control application life and create native browser window

const {app, BrowserWindow, globalShortcut, ipcMain, Menu, Tray  } = require('electron')
const path = require('path')
const { clipboard } = require('electron')
const ks = require('node-key-sender');
const db = require("./database")
const { Op } = require("sequelize");

let mainWindow

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    show: false,
    resizable: false,
    frame: false,
    icon: "clippy.png",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      allowRunningInsecureContent: true,
    },
  })

  tray = new Tray('clippy.png')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: function() {
      mainWindow.show();
    } },
    { label: 'Quit', click: function() {
      app.exit();
    } },
  ])
  tray.setToolTip('Canned responses')
  tray.setContextMenu(contextMenu)

  mainWindow.on('hide', function () {
    SendTopUsed()
  })

  // and load the index.html of the app.
  mainWindow.loadFile('contents/index.html')
  
  // Register a 'CommandOrControl+X' shortcut listener.
  const ret = globalShortcut.register('alt+C', () => {
    mainWindow.show();
  })

  if (!ret) {
    console.log('registration failed')
  }

  setTimeout(() => {
    SendTopUsed()
  }, 500)
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

ipcMain.on('process-query', async (event, args) => {
  // Query the database, send back results
  if(args.length > 0) {

    let data;
    if(args[0] == "#" && args.length > 1) {
      data = await SearchId(args.substring(1))
    } else if (args[0] == "@" && args.length > 1) {
      data = await SearchBody(args.substring(1))
    } else {
      data = await SearchName(args.substring(1))
    }
  
    let snips = [];
    data.forEach(snip => {
      snips.push({id: snip.id, name: snip.name, body: snip.body, uses: snip.uses})
    })
  
    mainWindow.webContents.send("list-items", snips)
  } else {
    SendTopUsed()
  }
});

ipcMain.on('create-snippet', async (event, args) => {
  await db.snippet.create({name: args.name, body: args.body});
  mainWindow.webContents.send("reload-query")
});

ipcMain.on('update-snippet', async (event, args) => {
  await db.snippet.update({name: args.name, body: args.body}, {
    where: {
      id: args.id 
    },
    attributes: ['id', 'name', 'body', 'uses']
  });

  mainWindow.webContents.send("reload-query")
});

ipcMain.on('delete-snippet', async (event, args) => {
  // Query the database, send back results
  await db.snippet.destroy({
    where: {
      id: args.id 
    }
  });

  mainWindow.webContents.send("reload-query")
});

ipcMain.on('close-window', (event, args) => {
  MinimizeWindow();
});

async function SearchName(name) {
  let data = await db.snippet.findAll({
    where: {
      name: {
        [Op.like]: `%${name}%`
      }
    },
    attributes: ['id', 'name', 'body', 'uses']
  });

  return data;
}

async function SearchId(id) {
  let data = await db.snippet.findAll({
    where: {
      id: id
    },
    attributes: ['id', 'name', 'body', 'uses']
  });

  return data;
}

async function SearchBody(text) {
  let data = await db.snippet.findAll({
    where: {
      body: {
        [Op.like]: `%${text}%`
      }
    },
    attributes: ['id', 'name', 'body', 'uses']
  });

  return data;
}

async function SendTopUsed() {
  let data = await db.snippet.findAll({
    limit: 10,
    order: [
        ['uses', 'DESC'],
        ['id', 'ASC'],
    ],
    attributes: ['id', 'name', 'body', 'uses']
  });

  let snips = [];
  data.forEach(snip => {
    snips.push({id: snip.id, name: snip.name, body: snip.body, uses: snip.uses})
  })

  mainWindow.webContents.send("list-items", snips)
}

function MinimizeWindow() {
  mainWindow.minimize();
  mainWindow.hide();
}

function copyToClip(text) {
  clipboard.writeText(text.replace(/\\n/g, "\n"));
}

function pasteText(text) {
  let curClip = clipboard.readText();

  clipboard.writeText(text.replace(/\\n/g, "\n"));

  ks.sendCombination([process.platform === 'darwin' ? 'command' : 'control', 'v']).then(done => {
    // restore clipbloard
    clipboard.writeText(curClip)
  })
}