import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Color, Titlebar } from 'custom-electron-titlebar';
import { DirId, IpcEvent } from '../app/model';

const eventNames = Object.values(IpcEvent);
export type Event = typeof eventNames[number];

contextBridge.exposeInMainWorld('ipc', {
  send(event: Event, ...args: unknown[]) {
    ipcRenderer.send(event, ...args);
  },
  on(event: Event, func: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args);

    ipcRenderer.on(event, subscription);

    return () => ipcRenderer.removeListener(event, subscription);
  },
  once(event: Event, func: (...args: unknown[]) => void) {
    ipcRenderer.once(event, (_event, ...args) => func(...args));
  }
});

ipcRenderer.send(IpcEvent.LOAD_NOTES, localStorage.getItem(DirId.STORAGE));

/**
 * Todo: Remove when dark theme bug is fixed
 * https://github.com/electron/electron/issues/23479
 * https://github.com/electron/electron/pull/33624
 */
window.addEventListener('DOMContentLoaded', () => {
  new Titlebar({
    backgroundColor: Color.fromHex('#333333'),
    icon: '../../../assets/icon.svg'
  });
});
