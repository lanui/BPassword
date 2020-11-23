import EventEmitter from 'events';
import ObservableStore from 'obs-store';
import Generator from '../accounts';
import logger from '../logger';
import BizError from '@/libs/biz-error';

import {
  WALLET_ENV3_EXISTS,
  PWD_ENV3_UNMATCHED,
  PARAMS_ILLEGAL,
} from '@/libs/biz-error/error-codes.js';

/*********************************************************************
 * AircraftClass ::
 *     @Description: Management Accounts
 *     @Description:
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-11-01
 **********************************************************************/

export default class AccountController extends EventEmitter {
  /**
   *
   * @param {object} opts
   * @property {object} initState [timeoutMinutes,env3]
   */
  constructor(opts = {}) {
    super();

    const {
      initState,
      unlockWebsiteCypher,
      lockedWebsitePlain,
      unlockMobileCypher,
      lockedMobilePlain,
    } = opts;
    // this state will persistence,don't put decrypt data
    this.store = new ObservableStore(
      Object.assign(
        {
          timeoutMinutes: 120,
        },
        initState
      )
    );

    this.unlockWebsiteCypher = unlockWebsiteCypher;
    this.lockedWebsitePlain = lockedWebsitePlain;
    this.unlockMobileCypher = unlockMobileCypher;
    this.lockedMobilePlain = lockedMobilePlain;

    this.memStore = new ObservableStore({ isUnlocked: false });
  }

  /**
   *
   * @param {string} password
   */
  async unlock(password) {
    if (typeof password !== 'string') throw 'parameter illegal.';

    const { env3 } = await this.store.getState();
    if (!env3) throw 'not found env3 in store.';
    try {
      const dev3 = await Generator.AsyncOpenWallet(env3, password);
      this.memStore.updateState({
        dev3,
        isUnlocked: Boolean(dev3),
        selectedAddress: env3.mainAddress,
      });

      const SubPriKey = dev3.SubPriKey;

      if (typeof this.unlockWebsiteCypher === 'function') {
        await this.unlockWebsiteCypher(SubPriKey);
      }
      if (typeof this.unlockMobileCypher === 'function') {
        this.unlockMobileCypher(SubPriKey);
      }

      return {
        isUnlocked: Boolean(dev3),
        isInitialized: true,
      };
    } catch (err) {
      console.warn(`unlock wallet failed.`, err);
      if (err && err.message === 'message authentication code mismatch') {
        throw new BizError('password incorrect.', PWD_ENV3_UNMATCHED);
      } else {
        throw new BizError(err.message, PWD_ENV3_UNMATCHED);
      }
    }
  }

  async lock() {
    try {
      await this.memStore.putState({ isUnlocked: false });
      if (typeof this.lockedWebsitePlain === 'function') {
        await this.lockedWebsitePlain();
      }
      if (typeof this.lockedMobilePlain === 'function') {
        this.lockedMobilePlain();
      }
    } catch (error) {
      logger.warn('logout failed.', error);
    }
    return true;
  }

  getEnv3() {
    const { env3 } = this.store.getState();
    return env3;
  }

  /**
   *
   * @param {*} password
   */
  async createWallet(password) {
    if (typeof password !== 'string') throw 'parameter illegal.';
    const { env3 } = this.store.getState();

    if (env3) {
      logger.error('the main account has been exists.');
      throw new BizError('the main account has been exists.', WALLET_ENV3_EXISTS);
    }

    try {
      // const ret = await Generator.GenerateWalletAndOpen(password);
      const ret = await Generator.GenerateWalletFull(password);

      this.store.updateState({ env3: ret.env3 });

      this.memStore.updateState({
        dev3: ret.dev3,
        isUnlocked: Boolean(ret.dev3),
        selectedAddress: ret.env3.mainAddress,
      });

      const SubPriKey = ret.dev3.SubPriKey;

      if (typeof this.unlockWebsiteCypher === 'function') {
        await this.unlockWebsiteCypher(SubPriKey);
      }

      if (typeof this.unlockMobileCypher === 'function') {
        this.unlockMobileCypher(SubPriKey);
      }

      return { ...ret, isUnlocked: Boolean(ret.dev3) };
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   * @param {object} env3 keystore
   * @param {string} password
   * @returns {object} initState
   */
  async importWallet(env3, password) {
    if (!env3 || !password) {
      throw new BizError('miss env3 or password', PARAMS_ILLEGAL);
    }
    try {
      const dev3 = await Generator.AsyncOpenWallet(env3, password);

      const _memState = {
        dev3,
        isUnlocked: Boolean(dev3),
        selectedAddress: env3.mainAddress,
      };

      this.memStore.updateState(_memState);
      const _subPriKey = dev3.SubPriKey;
      if (typeof this.unlockWebsiteCypher === 'function') {
        await this.unlockWebsiteCypher(_subPriKey);
      }
      if (typeof this.unlockMobileCypher === 'function') {
        this.unlockMobileCypher(_subPriKey);
      }
      this.store.updateState({ env3: env3 });

      return {
        env3,
        isUnlocked: Boolean(dev3),
        isInitialized: Boolean(env3),
      };
    } catch (error) {
      logger.debug('importWallet>>>', error);
      throw new BizError('The password does not match the keystore.', PWD_ENV3_UNMATCHED);
    }
  }

  /**
   *
   */
  async getSubPriKey() {
    const { dev3 } = await this.memStore.getState();

    if (!dev3 && !dev3.SubPriKey) throw new BizError('account is locked.', SUB_SECRET_KEY_ILLEGAL);
    return dev3.SubPriKey;
  }

  /**
   * getFlatState
   */
  getState() {
    const memState = this.memStore.getState();
    const { timeoutMinutes } = this.store.getState();

    return {
      autoLockedMinutes: timeoutMinutes || 0,
      ...memState,
    };
  }
}
