import { nanoid } from 'nanoid';
import extension from '../../extensionizer';
import logger from '../../logger';

import { injetExtState } from './extension-info';

import {
  API_RT_CREATE_WALLET,
  API_RT_IMPORT_WALLET,
  API_RT_LOGIN_WALLET,
  API_RT_LOGOUT_WALLET,
  API_RT_ADD_WEB_ITEM,
  API_RT_EDIT_WEB_ITEM,
  API_RT_DELETE_WEB_ITEM,
  API_RT_ADD_MOB_ITEM,
  API_RT_EDIT_MOB_ITEM,
  API_RT_DELETE_MOB_ITEM,
  API_RT_FILL_FEILDS,
  API_FETCH_EXT_STATE,
} from '../../msgapi/api-types';

import { checkApiType } from '../../msgapi';
import BPError from '../../biz-error';
import { INTERNAL_ERROR } from '../../biz-error/error-codes';
/*********************************************************************
 * AircraftClass :: Whisperer for fox
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-21
 *    @comments:
 **********************************************************************/
class WhisperperListener {
  constructor({ controller }) {
    this.controller = controller;
    this._uuid = nanoid();

    extension.runtime.onMessage.addListener(HandleCypherApi.bind(this));
  }

  getExtInfo(reqData, sender) {
    const respData = {
      ...reqData,
      ts: new Date().getTime(),
      extid: 'bpassword_ext@gmail.com',
    };

    if (sender && sender.id === extension.runtime.id) {
      return Object.assign({}, respData, injetExtState());
    } else {
      return respData;
    }
  }

  async createWallet(reqData) {
    const { password } = reqData;
    const ret = await this.controller.accountController.createWallet(password);
    const { env3 } = ret;
    const initState = this.controller.getState();

    const respData = { env3, ...initState };

    logger.debug(`addWebsiteItem:${this._uuid}:Response Data>>>`, respData);
    return respData;
  }

  async importWallet(reqData) {
    const { env3, password } = reqData;

    const retState = await this.controller.accountController.importWallet(env3, password);
    const respData = Object.assign({}, this.controller.getState(), retState);

    logger.debug(`addWebsiteItem:${this._uuid}:Response Data>>>`, respData);
    return respData;
  }

  async login(reqData) {
    const { password } = reqData;
    const dev3 = await this.controller.accountController.unlock(password);
    const initState = this.controller.getState();
    await this.controller.unlockedNotifyCommunications();
    return initState;
  }

  async logout() {
    const ret = await this.controller.accountController.lock();
    const initState = this.controller.getState();

    if (this.controller.lockingNotifyAllCommunications) {
      await this.controller.lockingNotifyAllCommunications();
    }

    return initState;
  }

  async addWebsiteItem(reqData) {
    const subPriKey = await this.controller.accountController.getSubPriKey();
    const respData = await this.controller.websiteController.addItem(subPriKey, reqData);

    logger.debug(`addWebsiteItem:${this._uuid}:Response Data>>>`, respData);

    return respData;
  }

  async updateWebsiteItem(reqData) {
    const subPriKey = await this.controller.accountController.getSubPriKey();
    const respData = await this.controller.websiteController.updateItem(subPriKey, reqData);

    logger.debug(`updateWebsiteItem:${this._uuid}:Response Data>>>`, respData);

    return respData;
  }

  async deleteWebSiteItem(reqData) {
    const subPriKey = await this.controller.accountController.getSubPriKey();
    const respData = await this.controller.websiteController.deleteItem(subPriKey, reqData);

    logger.debug(`deleteWebSiteItem:${this._uuid}:Response Data>>>`, respData);

    return respData;
  }

  async addMobileItem(reqData) {
    const subPriKey = await this.controller.accountController.getSubPriKey();
    const respData = await this.controller.mobileController.addItem(subPriKey, reqData);

    logger.debug(`addMobileItem:${this._uuid}:Response Data>>>`, respData);

    return respData;
  }

  async updateMobileItem(reqData) {
    const subPriKey = await this.controller.accountController.getSubPriKey();
    const respData = await this.controller.mobileController.updateItem(subPriKey, reqData);

    logger.debug(`updateMobileItem:${this._uuid}:Response Data>>>`, respData);

    return respData;
  }

  async deleteMobileItem(reqData) {
    const subPriKey = await this.controller.accountController.getSubPriKey();
    const respData = await this.controller.mobileController.deleteItem(subPriKey, reqData);

    logger.debug(`deleteMobileItem:${this._uuid}:Response Data>>>`, respData);

    return respData;
  }

  async filledFieldValt(reqData, sender) {
    // logger.debug(`WhisperListener Received Data>filledFieldValt>>`, reqData, sender);
    if (sender && sender.tab) {
      const tabId = sender.tab.id;
      this.controller.filledLoginFeilds(tabId, reqData);
      return true;
    } else {
      throw new BizError('Miss tab id for filledFieldValt');
    }
  }
}

async function HandleCypherApi(message, sender, sendResp) {
  if (typeof message !== 'object' && !message.apiType) {
    throw new BPError('Message type illegal.');
  }
  const apiType = message.apiType;
  checkApiType(apiType);

  try {
    let reqData = message.reqData;
    logger.debug(`WhisperListener Received Data>>>`, apiType, sender);
    switch (apiType) {
      case API_FETCH_EXT_STATE:
        return this.getExtInfo(reqData, sender);
      case API_RT_CREATE_WALLET:
        return this.createWallet(reqData);
      case API_RT_IMPORT_WALLET:
        return this.importWallet(reqData);
      case API_RT_LOGIN_WALLET:
        return this.login(reqData);
      case API_RT_LOGOUT_WALLET:
        return this.logout(reqData);
      case API_RT_ADD_WEB_ITEM:
        return this.addWebsiteItem(reqData);
      case API_RT_EDIT_WEB_ITEM:
        return this.updateWebsiteItem(reqData);
      case API_RT_DELETE_WEB_ITEM:
        return this.deleteWebSiteItem(reqData);
      case API_RT_ADD_MOB_ITEM:
        return this.addMobileItem(reqData);
      case API_RT_EDIT_MOB_ITEM:
        return this.updateMobileItem(reqData);
      case API_RT_DELETE_MOB_ITEM:
        return this.deleteMobileItem(reqData);
      case API_RT_FILL_FEILDS:
        logger.debug(`WhisperListener Received Data>>>`, apiType, reqData);
        return this.filledFieldValt(reqData, sender);
      default:
        throw new BPError(`Message type: ${apiType} unsupport in firefox.`);
    }
  } catch (error) {
    errorThrower(error);
  }
}

function errorThrower(err) {
  if (typeof err === 'object' && err.code) {
    throw err;
  } else if (typeof err === 'object' && err.code) {
    throw new BPError(err.message, INTERNAL_ERROR);
  } else {
    err = err ? err.toString() : 'unknow error';
    throw new BPError(err, INTERNAL_ERROR);
  }
}

export default WhisperperListener;
