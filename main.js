// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, desktopCapturer } = require("electron");
const isDevelopment = !app.isPackaged;
const path = require("path");
const EVENT = require("./events");
let mainWindow = null;
let availableScreen = [];
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDevelopment) {
    mainWindow.loadURL("http://localhost:3000/");
    //mainWindow.webContents.openDevTools();
  } else {
    // and load the index.html of the app.

    mainWindow.loadURL(
      `file://${path.resolve(__dirname, "/build/", "index.html")}`
    );


  }

mainWindow.webContents.on('unresponsive',(e)=>{
  console.log(e,'un responsive')
})

  ipcMain.on(EVENT.INITIATE_CAPTURE, screencapture);
  ipcMain.on(EVENT.SELECT_CAPTURE_SCREEN, handleOnSelectCaptureScreen);
  ipcMain.on(EVENT.STOP_CAPTURE_SCREEN, handleOnStopCaptureScreen);
  ipcMain.on(
    EVENT.HAS_INITIATED_CAPTURE_SCREEN,
    handleOnInitiatedCaptureScreen
  );
 
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.ß
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// In the main process.
const screencapture = () => {
  console.log("capture");
  desktopCapturer
    .getSources({ types: ["window", "screen"] })
    .then(async (sources) => {
      availableScreen = sources;
      mainWindow.webContents.send(EVENT.INITIATE_CAPTURE, availableScreen);
      /* for (const source of sources) {
      console.log(source.name)
      if (source.name === 'Entire screen') {
        mainWindow.webContents.send('SET_SOURCE', source.id)
        return
      }
    } */
    });
};

const handleOnSelectCaptureScreen = (e, screenId) => {
  console.log(availableScreen?.length);

  mainWindow.webContents.send("SET_SOURCE", screenId);
};

const handleOnStopCaptureScreen = () => {
  availableScreen = null;
  console.log('remove screen')
  mainWindow.webContents.send(EVENT.STOP_CAPTURE_SCREEN);
};

const handleOnInitiatedCaptureScreen = () => {
  mainWindow.webContents.send(EVENT.HAS_INITIATED_CAPTURE_SCREEN);
};

ipcMain.on('errorInWindow', function(event, data){
  console.log(data)
});

