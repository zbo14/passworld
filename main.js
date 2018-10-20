'use strict'

const { app, BrowserWindow } = require('electron')

let win

const createWindow = () => {
  win = new BrowserWindow({ width: 800, height: 600 })

  /* eslint-disable-next-line */
  win.eval = global.eval = () => {
    throw new Error('Sorry, this app doesn\'t support window.eval()')
  }

  win.loadFile('index.html')

  if (process.env.NODE_ENV === 'dev') {
    win.webContents.openDevTools()
  }

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
