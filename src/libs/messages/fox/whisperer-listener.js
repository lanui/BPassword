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
  API_RT_CHANGED_NETWORK,
  API_RT_RELOAD_CHAIN_BALANCES,
  API_RT_FETCH_BTAPPROVED_RAW_DATA,
  API_RT_FETCH_REGIST_MEMBER_RAW_DATA,
  API_RT_ADDORUP_TX_STATE,
  API_RT_SYNC_WEBSITE_DATA,
  API_RT_FETCH_WEBSITE_COMMIT_RAWDATA,
  API_RT_SYNC_MOBILE_DATA,
  API_RT_FETCH_MOBILE_COMMIT_RAWDATA,
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

    const { dev3 } = await this.controller.accountController.getWalletState();

    await this.controller.websiteController.unlock(dev3.SubPriKey);
    await this.controller.mobileController.unlock(dev3.SubPriKey);

    await this.controller.reloadDependencyWalletState();

    const initState = this.controller.getState();
    const respData = { env3, ...initState };
    logger.debug(`addWebsiteItem:${this._uuid}:Response Data>>>`, respData);
    return respData;
  }

  async importWallet(reqData) {
    const { env3, password } = reqData;

    const retState = await this.controller.accountController.importWallet(env3, password);
    const respData = Object.assign({}, this.controller.getState(), retState);

    const { dev3 } = this.controller.accountController.getWalletState();
    await this.controller.websiteController.unlock(dev3.SubPriKey);
    await this.controller.mobileController.unlock(dev3.SubPriKey);

    await this.controller.reloadDependencyWalletState();

    logger.debug(`addWebsiteItem:${this._uuid}:Response Data>>>`, respData);
    return respData;
  }

  /**
   *
   * @param {*} reqData
   */
  async login(reqData) {
    const { password } = reqData;
    await this.controller.accountController.unlock(password);
    // const { selectedAddress, isUnlocked } = this.controller.accountController.getWalletState();
    const { dev3 } = this.controller.accountController.getWalletState();
    logger.debug('unlock dev3', dev3);
    // website unlock
    await this.controller.websiteController.unlock(dev3.SubPriKey);
    await this.controller.mobileController.unlock(dev3.SubPriKey);

    // reload web3 state[status config]
    await this.controller.reloadDependencyWalletState();

    const initState = this.controller.getState();
    await this.controller.unlockedNotifyCommunications();
    return initState;
  }

  async logout() {
    const ret = await this.controller.accountController.lock();

    // locked release memStore
    await this.controller.websiteController.locked();
    await this.controller.mobileController.locked();

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

  async changedNetworkState(reqData) {
    const networkState = await this.controller.networkController.changedNetwork(reqData);
    const currentProvider = await this.controller.networkController.getCurrentProvider();
    const web3State = await this.controller.web3Controller.reloadBalances(currentProvider);
    const selectedAddress = await this.controller.accountController.getMainAddress();

    await this.controller.web3Controller.emit(
      'web3:reload:member:status',
      currentProvider,
      selectedAddress
    );

    await this.controller.web3Controller.emit(
      'web3:reload:config',
      currentProvider,
      selectedAddress
    );

    const WebsiteController = await this.controller.websiteController.reinitializeCypher(false);
    // logger.debug('>>>changedNetworkState>>>>', networkState, web3State, selectedAddress);
    return {
      NetworkController: networkState,
      Web3Controller: web3State,
      WebsiteController,
    };
  }

  async reloadTokenBalances(reqData) {
    return this.controller.web3Controller.reloadBalances();
  }

  /**
   *
   * @param {object} reqData
   */
  async signedForBTApproved(reqData) {
    return this.controller.web3Controller.signedBTApproved4Member(reqData);
  }

  async signedForRegistMember(reqData) {
    return this.controller.web3Controller.signedRegistedMemberByYear(reqData);
  }

  async mergeWebsiteChainData(reqData) {
    return this.controller.websiteController.mergeLocalFromChainCypher();
  }

  async signedWebsiteCommitRawData(reqData) {
    const { reqId, gasPriceSwei } = reqData;
    const cypher64 = await this.controller.websiteController.getCypher64();
    if (!cypher64) {
      throw new BizError('miss locale cypher data.', INTERNAL_ERROR);
    }
    return await this.controller.web3Controller.signedWebsiteCommitCypher(
      reqId,
      gasPriceSwei,
      cypher64
    );
  }

  async mergeMobileChainData(reqData) {
    return this.controller.mobileController.mergeLocalFromChainCypher();
  }

  async signedMobileCommitRawData(reqData) {
    const { reqId, gasPriceSwei } = reqData;
    const cypher64 = await this.controller.mobileController.getCypher64();
    if (!cypher64) {
      throw new BizError('miss locale cypher data.', INTERNAL_ERROR);
    }

    return await this.controller.web3Controller.signedMobileCommitCypher(
      reqId,
      gasPriceSwei,
      cypher64
    );
  }
  /**
   *
   * {uid:txState}
   * @param {object} reqData
   */
  async addOrUpdateChainTxState(reqData) {
    logger.debug(`Whisperer signedForBTApproved>>>`, reqData);
    if (typeof reqData !== 'object') {
      throw new BizError('txState illegal. it must contain reqId,chainId,txHash', INTERNAL_ERROR);
    }
    const { reqId } = reqData;

    const chainTxs = await this.controller.web3Controller.chainTxStatusUpdateForUI(reqData);

    return {
      reqId,
      chainTxs,
    };
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
    logger.debug(`WhisperListener Received Data>>>`, apiType, sender, reqData);
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
        return this.filledFieldValt(reqData, sender);
      case API_RT_CHANGED_NETWORK:
        return this.changedNetworkState(reqData);
      case API_RT_RELOAD_CHAIN_BALANCES:
        return this.reloadTokenBalances(reqData);
      case API_RT_FETCH_BTAPPROVED_RAW_DATA:
        return this.signedForBTApproved(reqData);
      case API_RT_ADDORUP_TX_STATE:
        return this.addOrUpdateChainTxState(reqData);
      case API_RT_FETCH_REGIST_MEMBER_RAW_DATA:
        return this.signedForRegistMember(reqData);
      case API_RT_SYNC_WEBSITE_DATA:
        return this.mergeWebsiteChainData(reqData);
      case API_RT_FETCH_WEBSITE_COMMIT_RAWDATA:
        return this.signedWebsiteCommitRawData(reqData);
      case API_RT_SYNC_MOBILE_DATA:
        return this.mergeMobileChainData(reqData);
      case API_RT_FETCH_MOBILE_COMMIT_RAWDATA:
        return this.signedMobileCommitRawData(reqData);

      default:
        throw new BPError(`Message type: ${apiType} unsupport in firefox.`);
    }
  } catch (error) {
    errorThrower(error);
  }
}

function errorThrower(err) {
  logger.debug('Whisper listener:', err);
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
