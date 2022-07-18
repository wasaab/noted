import { Event } from 'main/preload';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(event: Event, ...args: unknown[]): void;
        once(event: Event, handler: (...args: unknown[]) => void): void;
        on(
          event: Event,
          handler: (...args: unknown[]) => void
        ): (() => void) | undefined;
      };
    };
  }
}

export {};
