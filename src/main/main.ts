/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import readline from 'readline';
import stream from 'stream';
import { createReadStream } from 'fs';
import {
  mkdir,
  readdir,
  readFile,
  rename,
  unlink,
  writeFile
} from 'fs/promises';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { setupTitlebar, attachTitlebarToWindow } from 'custom-electron-titlebar/main';
import { DirId, IpcEvent } from '../app/model';
import { buildMatcher } from '../app/util';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let notesDir: string;
let selectedNotesDir: string | undefined;

ipcMain.on(IpcEvent.LOAD_NOTES, async (_event, dir) => {
  notesDir = dir;
});

function buildNotePath(noteId: string, isTrash?: boolean) {
  return path.join(
    notesDir,
    isTrash ? DirId.TRASH : DirId.NOTES,
    `${noteId}.md`
  );
}

ipcMain.on(IpcEvent.OPEN_NOTE, async (event, noteId) => {
  readFile(buildNotePath(noteId), { encoding: 'utf-8' })
    .then((content) => event.reply(IpcEvent.NOTE_OPENED, content))
    .catch((err) => {
      console.error(`Failed to open note "${noteId}":`, err);
    });
});

ipcMain.on(IpcEvent.SAVE_NOTE, async (event, noteId, content = '') => {
  writeFile(buildNotePath(noteId), content)
    .then(() => {
      if (content) { return; }

      event.reply(IpcEvent.NOTE_OPENED);
    })
    .catch((err) => {
      console.error(`Failed to save note "${noteId}":`, err);
    });
});

ipcMain.on(IpcEvent.MOVE_TRASH, async (_event, noteId, isRestore) => {
  const currPath = buildNotePath(noteId, isRestore);
  const destPath = buildNotePath(noteId, !isRestore);

  rename(currPath, destPath).catch((err) => {
    console.error(`Failed to move note "${noteId}":`, err);
  });
});

ipcMain.on(IpcEvent.DELETE_TRASH, async (_event, noteId) => {
  unlink(buildNotePath(noteId, true)).catch((err) => {
    console.error(`Failed to delete trash "${noteId}":`, err);
  });
});

function createDir(dirName: string) {
  mkdir(path.join(notesDir, dirName)).catch(() => {
    console.log('Using existing files in dir:', dirName);
  });
}

ipcMain.on(IpcEvent.SAVE_SETTINGS, async (event) => {
  if (!selectedNotesDir) { return; }

  notesDir = selectedNotesDir;
  event.reply(IpcEvent.SETTINGS_SAVED, notesDir);
  createDir(DirId.NOTES);
  createDir(DirId.TRASH);
});

type Hit = {
  text: string;
  lineNum: number;
};

type SearchResult = {
  id: string;
  hits: Hit[];
  hitsCount: number;
};

const searchNote = (fileName: string, query: string): Promise<SearchResult> => {
  return new Promise((resolve) => {
    const inStream = createReadStream(path.join(notesDir, DirId.NOTES, fileName));
    const outStream = new stream.Writable();
    const rl = readline.createInterface(inStream, outStream);
    const hits: Hit[] = [];
    const queryMatcher = buildMatcher(query);
    let hitsCount = 0;
    let lineNum = 0;

    rl.on('line', (text) => {
      if (!queryMatcher.test(text)) { return; }

      // count additional matches starting search from last match
      do {
        hitsCount++;
      } while (queryMatcher.test(text));

      hits.push({ text, lineNum: ++lineNum });
    });

    rl.on('close', () => resolve({ id: fileName.slice(0, -3), hits, hitsCount }));
  });
};

ipcMain.on(IpcEvent.SEARCH, async (event, query) => {
  if (!query) { return; }

  readdir(path.join(notesDir, DirId.NOTES))
    .then((notes) => Promise.all(notes.map((noteId) => searchNote(noteId, query))))
    .then((results) => results.filter(({ hits }) => hits.length !== 0))
    .then((searchResults) => event.reply(IpcEvent.SEARCHED, searchResults))
    .catch((err) => {
      console.error(`Failed to search for "${query}"`, err);
    });
});

ipcMain.on(IpcEvent.SELECT_NOTES_DIR, async (event) => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });

  if (filePaths.length === 0) { return; }

  [selectedNotesDir] = filePaths;

  event.reply(IpcEvent.NOTES_DIR_SELECTED, selectedNotesDir);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');

  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

/**
 * Todo: Remove when dark theme bug is fixed
 * https://github.com/electron/electron/issues/23479
 * https://github.com/electron/electron/pull/33624
 */
setupTitlebar();

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    /**
     * Todo: Remove when dark theme bug is fixed
     * https://github.com/electron/electron/issues/23479
     * https://github.com/electron/electron/pull/33624
     */
    frame: false, // hide native title bar
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.ico'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js')
    }
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  /**
   * Todo: Remove when dark theme bug is fixed
   * https://github.com/electron/electron/issues/23479
   * https://github.com/electron/electron/pull/33624
   */
  attachTitlebarToWindow(mainWindow);

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
