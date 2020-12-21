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

    const { initState } = opts;
    // this state will persistence,don't put decrypt data
    this.store = new ObservableStore(
      Object.assign(
        {
          timeoutMinutes: 120,
        },
        initState
      )
    );

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

      return {
        isUnlocked: Boolean(dev3),
        isInitialized: true,
        dev3,
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

      return { ...ret, isUnlocked: Boolean(ret.dev3) };
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getMainAddress() {
    const { env3 } = await this.store.getState();
    return !env3 ? undefined : env3?.mainAddress;
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
   * @returns object or null
   *
   */
  getWalletState() {
    let memState = this.memStore.getState();
    let { env3 } = this.store.getState();
    if (!env3) return null;
    let baseState = {
      selectedAddress: env3.mainAddress,
      isUnlocked: false,
    };
    const walletState = { ...baseState, ...memState };
    return walletState;
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
