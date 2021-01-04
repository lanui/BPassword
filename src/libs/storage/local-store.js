import extension from '../extensionizer';
import { checkForError } from '../utils';
import logger from '../logger';

export default class ExtensionStore {
  constructor() {
    this.isSupported = !!extension.storage.local;

    if (!this.isSupported) {
      logger.error('Storage local API not available.');
    }
  }

  async get() {
    if (!this.isSupported) {
      return undefined;
    }

    const result = await this._get();

    if (isEmpty(result)) {
      return undefined;
    } else {
      return result;
    }
  }

  /**
   *
   * @param {Object} state
   * @returns {Promise<void>}
   */
  async set(state) {
    return this._set(state);
  }

  /**
   * @returns {object} - the key-value map from local storage
   * @private
   */
  _get() {
    const local = extension.storage.local;
    return new Promise((resolve, reject) => {
      local.get(null, (result) => {
        const err = checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Sets the key in local state
   * @param {Object} obj - The key to set
   * @returns {Promise<void>}
   * @private
   */
  _set(obj) {
    const local = extension.storage.local;
    logger.debug('Local-storage>>>>>', obj);
    return new Promise((resolve, reject) => {
      local.set(obj, () => {
        const err = checkForError();
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  _clear() {
    const local = extension.storage.local;
    return new Promise((resolve, reject) => {
      local.clear(() => {
        const err = checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
