import extension from '../../extensionizer';
import logger from '../../logger';

import {
  buildErrorResponseMessage,
  buildResponseMessage,
} from '@/libs/messages/datastruct-helpers';

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
} from '../../msgapi/api-types';

/*********************************************************************
 * AircraftClass ::
 *     @Description:
 *     @Description:
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-11-09
 **********************************************************************/
class WhispererListener {
  constructor({ controller }) {
    this.controller = controller;
    extension.runtime.onMessage.addListener(handleWhispererMessage.bind(this));
  }

  /**
   *
   * @param {*} message
   * @param {*} sender
   * @param {*} sendResponse
   */
  async createWallet(message, sender, sendResponse) {
    const { apiType, reqData } = message;
    try {
      const { password } = reqData;
      const ret = await this.controller.accountController.createWallet(password);
      const { env3 } = ret;
      const initState = this.controller.getState();
      const respMessage = buildResponseMessage(apiType, { env3, ...initState });

      sendResponse(respMessage);
    } catch (err) {
      const errResponse = buildErrorResponseMessage(apiType, err);
      sendResponse(errResponse);
    }
  }

  async importNewWallet(message, sender, sendResponse) {
    const { apiType, reqData } = message;
    try {
      const { env3, password } = reqData;
      // retState {env3,isUnlocked}
      const retState = await this.controller.accountController.importWallet(env3, password);
      const initState = Object.assign({}, this.controller.getState(), retState);
      const respMessage = buildResponseMessage(apiType, initState);

      sendResponse(respMessage);
    } catch (error) {
      const errResponse = buildErrorResponseMessage(apiType, error);
      sendResponse(errResponse);
    }
  }

  /**
   *
   * @param {object} message
   * @param {*} sender
   * @param {*} sendResponse
   */
  async login(message, sender, sendResponse) {
    const { apiType, reqData } = message;
    try {
      const { password } = reqData;
      const dev3 = await this.controller.accountController.unlock(password);
      const initState = this.controller.getState();
      const respMessage = buildResponseMessage(apiType, initState);
      sendResponse(respMessage);
      //TODO notice tab login
    } catch (err) {
      const errResponse = buildErrorResponseMessage(apiType, err);
      sendResponse(errResponse);
    }
  }

  async logout(message, sender, sendResponse) {
    const { apiType, reqData } = message;
    const ret = await this.controller.accountController.lock();
    const initState = this.controller.getState();
    const respMessage = buildResponseMessage(apiType, initState);
    sendResponse(respMessage);
    //TODO notice tab logout
  }

  async addWebsiteItem(message, sender, sendResponse) {
    const { apiType, reqData } = message;
    logger.debug('addWebsiteItem', reqData);
    try {
      const subPriKey = await this.controller.accountController.getSubPriKey();
      const respData = await this.controller.websiteController.addItem(subPriKey, reqData);
      const respMessage = buildResponseMessage(apiType, respData);
      sendResponse(respMessage);

      //TODO emit other client
    } catch (err) {
      const errResponse = buildErrorResponseMessage(apiType, err);
      sendResponse(errResponse);
    }
  }

  async updateWebsiteItem(message, sender, sendResponse) {
    const { apiType, reqData } = message;
    try {
      const subPriKey = await this.controller.accountController.getSubPriKey();
      const respData = await this.controller.websiteController.updateItem(subPriKey, reqData);
      const respMessage = buildResponseMessage(apiType, respData);
      sendResponse(respMessage);

      //TODO emit other client
    } catch (err) {
      const errResponse = buildErrorResponseMessage(apiType, err);
      sendResponse(errResponse);
    }
  }

  async deleteWebsiteItem(message, sender, sendResponse) {
    const { apiType, reqData } = message;
    try {
      const subPriKey = await this.controller.accountController.getSubPriKey();
      const respData = await this.controller.websiteController.deleteItem(subPriKey, reqData);
      const respMessage = buildResponseMessage(apiType, respData);
      sendResponse(respMessage);

      //TODO emit other client
    } catch (err) {
      const errResponse = buildErrorResponseMessage(apiType, err);
      sendResponse(errResponse);
    }
  }

  async addMobileItem(message, sender, sendResponse) {
    const { apiType, reqData } = message;
    try {
      const subPriKey = await this.controller.accountController.getSubPriKey();
      const respData = await this.controller.mobileController.addItem(subPriKey, reqData);

      const respMessage = buildResponseMessage(apiType, respData);
      sendResponse(respMessage);
    } catch (err) {
      const errResponse = buildErrorResponseMessage(apiType, err);
      sendResponse(errResponse);
    }
  }

  async updateMobileItem(message, sender, sendResponse) {
    const { apiType, reqData } = message;
    try {
      const subPriKey = await this.controller.accountController.getSubPriKey();
      const respData = await this.controller.mobileController.updateItem(subPriKey, reqData);
      const respMessage = buildResponseMessage(apiType, respData);
      sendResponse(respMessage);
    } catch (err) {
      const errResponse = buildErrorResponseMessage(apiType, err);
      sendResponse(errResponse);
    }
  }

  async deleteMobileItem(message, sender, sendResponse) {
    const { apiType, reqData } = message;
    try {
      const subPriKey = await this.controller.accountController.getSubPriKey();
      const respData = await this.controller.mobileController.deleteItem(subPriKey, reqData);
      const respMessage = buildResponseMessage(apiType, respData);
      sendResponse(respMessage);
    } catch (err) {
      const errResponse = buildErrorResponseMessage(apiType, err);
      sendResponse(errResponse);
    }
  }

  async filledFeilds(message, sender, sendResponse) {
    logger.debug('WhispererListener:filledFeilds>>>>>', message, sender);
    const { apiType, reqData } = message;
    if (!reqData || !sender || !sender.tab) {
      sendResponse(false);
      return;
    }
    const tabId = sender.tab.id;

    try {
      const ret = this.controller.filledLoginFeilds(tabId, reqData);
      sendResponse(ret);
    } catch (err) {
      sendResponse(false);
    }
  }
}

/**
 * The Whisperper entry
 * @param {object} message [apiType,reqData]
 * @param {object} sender extension sender
 * @param {function} sendResponse callback
 */
async function handleWhispererMessage(message, sender, sendResponse) {
  const isFn = typeof sendResponse === 'function';
  if (typeof message !== 'object' && !message.apiType) {
    return false;
  } else {
    logger.debug(
      `WhispererListener Received untrusted:senderId:[${sender.id},${sender.origin}] >>>`,
      message
    );
  }

  switch (message.apiType) {
    case API_RT_CREATE_WALLET:
      this.createWallet(message, sender, sendResponse);
      break;
    case API_RT_IMPORT_WALLET:
      this.importNewWallet(message, sender, sendResponse);
      break;
    case API_RT_LOGIN_WALLET:
      this.login(message, sender, sendResponse);
      break;
    case API_RT_LOGOUT_WALLET:
      this.logout(message, sender, sendResponse);
      break;
    case API_RT_ADD_WEB_ITEM:
      this.addWebsiteItem(message, sender, sendResponse);
      break;
    case API_RT_EDIT_WEB_ITEM:
      this.updateWebsiteItem(message, sender, sendResponse);
      break;
    case API_RT_DELETE_WEB_ITEM:
      this.deleteWebsiteItem(message, sender, sendResponse);
      break;
    case API_RT_ADD_MOB_ITEM:
      this.addMobileItem(message, sender, sendResponse);
      break;
    case API_RT_EDIT_MOB_ITEM:
      this.updateMobileItem(message, sender, sendResponse);
      break;
    case API_RT_DELETE_MOB_ITEM:
      this.deleteMobileItem(message, sender, sendResponse);
      break;
    case API_RT_FILL_FEILDS:
      this.filledFeilds(message, sender, sendResponse);
      break;

    default:
      break;
  }
  if (isFn) {
    return true;
  } else {
  }
}

export default WhispererListener;
