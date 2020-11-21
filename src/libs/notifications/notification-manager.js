import ExtPlatform from '../platforms';

import { NOTIFY_PAGER } from '../pager-cnst';

export const notifyPopupType = 'popup';
const NOTIFICATION_HEIGHT = 320;
const NOTIFICATION_WIDTH = 420;

/**
 *
 */
class NotificationManager {
  constructor() {
    this.platform = new ExtPlatform();
  }

  /**
   * 显示 Notification page
   */
  async showPopup() {
    const popup = await this._getPopup();
    if (popup) {
      await this.platform.focusWindow(popup.id);
    } else {
      let left = 0,
        top = 0;
      try {
        const lastFocused = await this.platform.getLastFocusedWindow();
        top = lastFocused.top;
        left = lastFocused.left + (lastFocused.width - NOTIFICATION_WIDTH);
      } catch (_) {
        const { screenX, screenY, outerWidth } = window;

        top = Math.max(screenY, 0);
        left = Math.max(screenX + (outerWidth - NOTIFICATION_WIDTH), 0);
      }

      //create new
      const popupWindow = await this.platform.openWindow({
        url: NOTIFY_PAGER,
        type: notifyPopupType,
        width: NOTIFICATION_WIDTH,
        height: NOTIFICATION_HEIGHT,
        left,
        top,
      });

      if (popupWindow.left !== left) {
        await this.platform.updateWindowPosition(popupWindow.id, left, top);
      }
      this._popupId = popupWindow.id;
    }
  }

  async _getPopup() {
    const windows = await this.platform.getAllWindows();
    return this._getPopupIn(windows);
  }

  _getPopupIn(windows) {
    return windows
      ? windows.find((win) => {
          return win && win.type === notifyPopupType && win.id === this._popupId;
        })
      : null;
  }
}

export default NotificationManager;
