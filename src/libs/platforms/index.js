import extension from '../extensionizer';
import { checkForError } from '../utils';

class ExtensionPlatform {
  constructor() {}

  reload() {
    extension.runtime.reload();
  }

  getVersion() {
    return extension.runtime.getManifest().version;
  }

  /**
   * @see https://developer.chrome.com/extensions/tabs#method-create
   * @param {Object} options [windowId,index,url,active,openerTabId]
   */
  openTab(options) {
    return new Promise((resolve, reject) => {
      extension.tabs.create(options, (newTab) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(newTab);
      });
    });
  }

  /**
   * 获取当前打开的所有浏览器窗口
   */
  getAllWindows() {
    return new Promise((resolve, reject) => {
      extension.windows.getAll((windows) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(windows);
      });
    });
  }

  /**
   * If window exists
   * @param {*} windowId
   */
  focusWindow(windowId) {
    return new Promise((resolve, reject) => {
      extension.windows.update(windowId, { focused: true }, () => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve();
      });
    });
  }

  getLastFocusedWindow() {
    return new Promise((resolve, reject) => {
      extension.windows.getLastFocused((win) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(win);
      });
    });
  }

  updateWindowPosition(winId, left, top) {
    return new Promise((resolve, reject) => {
      extension.windows.update(winId, { left, top }, () => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve();
      });
    });
  }
}

export default ExtensionPlatform;
